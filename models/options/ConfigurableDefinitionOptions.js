const errorPrefix = 'Error in configuration in htmlConfigurableAutocomplete.definitionProviders:'

module.exports = class ConfigurableDefinitionOptions {
    /**
     * Enable/disable this matching rule. Optional, defaults to true.
     * @type {boolean}
     */
    enable = true;

    /**
     * This transformer will transform the definitionRegexp matched text. Optional. Default is no transformer.
     * @type {string}
     */
    definitionTransformer = '';

    /**
     * A regexp used to detect whether the cursor is on a definition name. The first capture group, if present, will be used as the name of the definition otherwise the whole match is used. Required.
     * @type {RegExp}
     */
    definitionRegexp;

    /**
     * All files matching this glob pattern will be scanned for definitions. Required. Supports variables ${dirName}, ${dirPath}, ${filePath}, ${fileName}, ${fileNameWithoutExtension}.
     * @type {string}
     */
    includeGlobPattern;

    /**
     * All files matching this glob pattern will be excluded from the scanning of definitions. Supports placeholders ${dirName}, ${dirPath}, ${filePath}, ${fileName}, ${fileNameWithoutExtension}. Optional, defaults to '' (no files excluded).
     * @type {string}
     */
    excludeGlobPattern = '';

    /**
     * This transformer will transform file content before the contentRegexp is executed. Optional. Default is no transformer.
     * @type {string}
     */
    contentTransformer = '';

    /**
     * A regexp used to extract a definition name from content. The first capture group is used, if present, otherwise the whole match is used. If it's equal to the definitionRegexp match, then that location will open. Required.
     * @type {RegExp}
     */
    contentRegexp;

    /**
     *
     * @param {object} options
     * @param {boolean|null|undefined} [options.enable]
     * @param {string|null|undefined} [options.definitionTransformer]
     * @param {string} [options.definitionRegexp]
     * @param {string} [options.includeGlobPattern]
     * @param {string|null|undefined} [options.excludeGlobPattern]
     * @param {string|null|undefined} [options.contentTransformer]
     * @param {string} [options.contentRegexp]
     */
    constructor ({ enable, definitionTransformer, definitionRegexp, includeGlobPattern, excludeGlobPattern, contentTransformer, contentRegexp }) {
      this.enable = enable != null ? enable : this.enable
      this.definitionRegexp = new RegExp(definitionRegexp, 'gi')
      this.contentRegexp = new RegExp(contentRegexp, 'gim')
      if (!includeGlobPattern) {
        throw new Error(`${errorPrefix} you must set includeGlobPattern because it's required`)
      }
      this.includeGlobPattern = includeGlobPattern
      this.excludeGlobPattern = excludeGlobPattern || this.excludeGlobPattern
      this.definitionTransformer = definitionTransformer || this.definitionTransformer
      this.contentTransformer = contentTransformer || this.contentTransformer
    }
}
