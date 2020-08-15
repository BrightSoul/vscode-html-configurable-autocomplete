const errorPrefix = 'Error in configuration in htmlConfigurableAutocomplete.referenceProviders:'

module.exports = class ConfigurableReferenceOptions {
    /**
     * Enable/disable this matching rule. Optional, defaults to true.
     * @type {boolean}
     */
    enable = true;

    /**
     * A regexp used to detect whether the cursor is on a name used to find references. The first capture group, if present, will be used as the name to find references otherwise the whole match is used. Required.
     * @type {RegExp}
     */
    referenceRegexp;

    /**
     * All files matching this glob pattern will be scanned for references. Required. Supports placeholders ${dirName}, ${dirPath}, ${filePath}, ${fileName}, ${fileNameWithoutExtension}.
     * @type {string}
     */
    includeGlobPattern;

    /**
     * All files matching this glob pattern will be excluded from the scanning of definitions. Supports placeholders ${dirName}, ${dirPath}, ${filePath}, ${fileName}, ${fileNameWithoutExtension}. Optional, defaults to '' (no files excluded).
     * @type {string}
     */
    excludeGlobPattern = '';

    /**
     * A regexp used to extract a reference from content. The first capture group is used, if present, otherwise the whole match is used. If it's equal to the referenceRegexp match, then that location will be suggested as a reference. Required.
     * @type {RegExp}
     */
    contentRegexp;

    /**
     * Maximum number of files to scan for references. Optional, defaults to 50.
     * @type {number}
     */
    maxFiles = 50;

    /**
     * Maximum number of references provided. Optional, defaults to 50.
     * @type {number}
     */
    maxReferences = 50;

    /**
     * Maximum number of referebces provided by each file. Optional, defaults to 50.
     * @type {number}
     */
    maxReferencesPerFile = 50;

    /**
     *
     * @param {object} options
     * @param {boolean|undefined} [options.enable]
     * @param {string} [options.referenceRegexp]
     * @param {string} [options.includeGlobPattern]
     * @param {string|undefined} [options.excludeGlobPattern]
     * @param {string} [options.contentRegexp]
     * @param {number|null|undefined} [options.maxFiles]
     * @param {number|null|undefined} [options.maxReferences]
     * @param {number|null|undefined} [options.maxReferencesPerFile]
     */
    constructor ({ enable, referenceRegexp, includeGlobPattern, excludeGlobPattern, contentRegexp, maxFiles, maxReferences: maxItems, maxReferencesPerFile: maxItemsPerFile }) {
      this.enable = enable != null ? enable : this.enable
      this.referenceRegexp = new RegExp(referenceRegexp, 'gi')
      this.contentRegexp = new RegExp(contentRegexp, 'gim')
      if (!includeGlobPattern) {
        throw new Error(`${errorPrefix} you must set includeGlobPattern because it's required`)
      }
      this.includeGlobPattern = includeGlobPattern
      this.excludeGlobPattern = excludeGlobPattern || this.excludeGlobPattern
      this.maxFiles = maxFiles || this.maxFiles
      this.maxReferences = maxItems || this.maxReferences
      this.maxReferencesPerFile = maxItemsPerFile || this.maxReferencesPerFile
    }
}
