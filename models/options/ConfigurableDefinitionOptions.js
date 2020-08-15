const errorPrefix = 'Error in configuration in htmlConfigurableAutocomplete.definitionProviders:'

module.exports = class ConfigurableDefinitionOptions {
    /**
     * Enable/disable this matching rule. Optional, defaults to true.
     * @type {boolean}
     */
    enable = true;

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
     * A regexp used to extract a definition name from content. The first capture group is used, if present, otherwise the whole match is used. If it's equal to the definitionRegexp match, then that location will open. Required.
     * @type {RegExp}
     */
    contentRegexp;

    /**
     *
     * @param {object} options
     * @param {boolean|undefined} [options.enable]
     * @param {string} [options.definitionRegexp]
     * @param {string} [options.includeGlobPattern]
     * @param {string|undefined} [options.excludeGlobPattern]
     * @param {string} [options.contentRegexp]
     */
    constructor ({ enable, definitionRegexp, includeGlobPattern, excludeGlobPattern, contentRegexp }) {
      this.enable = enable != null ? enable : this.enable
      this.definitionRegexp = new RegExp(definitionRegexp, 'gi')
      this.contentRegexp = new RegExp(contentRegexp, 'gim')
      if (!includeGlobPattern) {
        throw new Error(`${errorPrefix} you must set includeGlobPattern because it's required`)
      }
      this.includeGlobPattern = includeGlobPattern
      this.excludeGlobPattern = excludeGlobPattern || this.excludeGlobPattern
    }
}
