const prefix = 'Error in configuration in htmlConfigurableAutocomplete.definitionProviders:';

module.exports = class ConfigurableDefinitionOptions {
    
    /**
     * Enable/disable this matching rule. Optional, defaults to true.
     * @type {boolean}
     */
    enable = true;

    /**
     * Definitions will be scanned only when when the cursor is at a position matched by this regexp. Required.
     * @type {RegExp}
     */
    definitionRegexp;

    /**
     * All files matching this glob pattern will be scanned for definitions. Required. Supports variables ${dirName}, ${dirPath}, ${filePath}, ${fileName}, ${fileNameWithoutExtension}.
     * @type {string}
     */
    includeGlobPattern;

    /**
     * All files matching this glob pattern will be excluded from the scanning of definitions. Optional, defaults to '' (no files excluded). Supports variables ${dirName}, ${dirPath}, ${filePath}, ${fileName}, ${fileNameWithoutExtension}.
     * @type {string}
     */
    excludeGlobPattern = '';

    /**
     * A regexp used to extract definition from content. The first match position will be used. Required.
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
    constructor({ enable, definitionRegexp, includeGlobPattern, excludeGlobPattern, contentRegexp }) {
        this.enable = enable != null ? enable : this.enable;
        this.definitionRegexp = new RegExp(definitionRegexp);
        this.contentRegexp = new RegExp(contentRegexp);
        if (!includeGlobPattern) {
            throw `${prefix} you must set includeGlobPattern because it's required`;
        }
        this.includeGlobPattern = includeGlobPattern;
        this.excludeGlobPattern = excludeGlobPattern || this.excludeGlobPattern;

    }
};