const { CompletionItemKind } = require('vscode')
const errorPrefix = 'Error in configuration in htmlConfigurableAutocomplete.completionItemProviders:'

module.exports = class ConfigurableCompletionItemOptions {
    /**
     * Enable/disable this matching rule. Optional, defaults to true.
     * @type {boolean}
     */
    enable = true;

    /**
     * The item completion will activate when the user types this/these characters. Required.
     * @type {Array<string>}
     */
    triggerCharacters;

    /**
     * A filtering regexp activating item completion only when the cursor is inside one of its matches. Optional.
     * @type {RegExp|undefined}
     */
    triggerRegexp = undefined;

    /**
     * This transformer will transform the current editor content before triggerRegexp is executed. Optional.
     * @type {string}
     */
    triggerTransformer = '';

    /**
     * Maximum number of files to scan for completion items. Optional, defaults to 50.
     * @type {number}
     */
    maxFiles = 50;

    /**
     * Maximum number of completion items provided. Optional, defaults to 50.
     * @type {number}
     */
    maxItems = 50;

    /**
     * Maximum number of completion items provided by each file. Optional, defaults to 50.
     * @type {number}
     */
    maxItemsPerFile = 50;

    /**
     * The item kind affects which icon will be displayed beside the completion item. Optional, defaults to 'Field'.
     * @type {CompletionItemKind}
     */
    itemKind = CompletionItemKind.Field;

    /**
     * All files matching this glob pattern will be scanned for completion items. This pattern is relative to the workspace folder. Optional, no files will be scanned by default. If you set it, you must also set contentRegexp. Supports placeholders ${dirName}, ${dirPath}, ${filePath}, ${fileName}, ${fileNameWithoutExtension} and (if you configured a definition provider) ${definitionDirName}, ${definitionDirPath}, ${definitionFilePath}, ${definitionFileName}, ${definitionFileNameWithoutExtension}.
     * @type {string|undefined}
     */
    includeGlobPattern;

    /**
     * All files matching this glob pattern will be excluded from the scanning of completion items. This pattern is relative to the workspace folder. Supports placeholders ${dirName}, ${dirPath}, ${filePath}, ${fileName}, ${fileNameWithoutExtension} and (if you configured a definition provider) ${definitionDirName}, ${definitionDirPath}, ${definitionFilePath}, ${definitionFileName}, ${definitionFileNameWithoutExtension}. Optional, no files are excluded by default.
     * @type {string|undefined}
     */
    excludeGlobPattern;

    /**
     * This transformer will transform the contentRegexp matched text. The transformed text will be displayed as the completion item to the user. Optional. Default is no transformer.
     * @type {string}
     */
    completionItemTransformer = '';

    /**
     * String prefix that will be prepended to the completion item when the user selects it. Tab characters (i.e. \\t) are interpreted as tab stops. Optional. Default is no prefix.
     * @type {string}
     */
    completionItemPrefix = '';

    /**
     * String suffix that will be appended to the completion item when the user selects it. Tab characters (i.e. \\t) are interpreted as tab stops. Optional. Default is no suffix.
     * @type {string}
     */
    completionItemSuffix = '';

    /**
     * This transformer will transform file content before the contentRegexp is executed. Optional. Default is no transformer.
     * @type {string}
     */
    contentTransformer = '';

    /**
     * A regexp used to extract completion items from content. The first capture group will be used, if present, otherwise the whole match is used. Optional. If you set it, you must also set includeGlobPattern.
     * @type {RegExp|undefined}
     */
    contentRegexp;

    /**
     * A list of statically provided completion items. Optional, defaults to an empty array.
     * @type {Array<string>}
     */
    staticItems = [];

    /**
     *
     * @param {object} options
     * @param {boolean|null|undefined} [options.enable]
     * @param {Array<string>} [options.triggerCharacters]
     * @param {string|null|undefined} [options.triggerRegexp]
     * @param {string|null|undefined} [options.triggerTransformer]
     * @param {number|null|undefined} [options.maxFiles]
     * @param {number|null|undefined} [options.maxItems]
     * @param {number|null|undefined} [options.maxItemsPerFile]
     * @param {string|undefined} [options.itemKind]
     * @param {string|null|undefined} [options.includeGlobPattern]
     * @param {string|null|undefined} [options.excludeGlobPattern]
     * @param {string|null|undefined} [options.completionItemTransformer]
     * @param {string|null|undefined} [options.completionItemPrefix]
     * @param {string|null|undefined} [options.completionItemSuffix]
     * @param {string|null|undefined} [options.contentTransformer]
     * @param {string} [options.contentRegexp]
     * @param {Array<string>} [options.staticItems]
     */
    constructor ({ enable, triggerCharacters, triggerRegexp, triggerTransformer, maxFiles, maxItems, maxItemsPerFile, itemKind, includeGlobPattern, excludeGlobPattern, completionItemTransformer, completionItemPrefix, completionItemSuffix, contentTransformer, contentRegexp, staticItems }) {
      if (!triggerCharacters || !Array.isArray(triggerCharacters) || triggerCharacters.length === 0) {
        throw new Error(`${errorPrefix} triggerCharacters is a required option and it must define at least one character`)
      }
      if (triggerCharacters.find(char => char.length !== 1)) {
        throw new Error(`${errorPrefix} each of triggerCharacters must be a string of length 1`)
      }
      this.triggerCharacters = triggerCharacters
      this.enable = enable != null ? enable : this.enable
      this.maxFiles = maxFiles || this.maxFiles
      this.maxItems = maxItems || this.maxItems
      this.maxItemsPerFile = maxItemsPerFile || this.maxItemsPerFile
      this.includeGlobPattern = includeGlobPattern || this.includeGlobPattern
      this.excludeGlobPattern = excludeGlobPattern || this.excludeGlobPattern
      this.staticItems = staticItems && Array.isArray(staticItems) ? staticItems : this.staticItems
      this.completionItemTransformer = completionItemTransformer || this.completionItemTransformer
      this.contentTransformer = contentTransformer || this.contentTransformer
      this.triggerTransformer = triggerTransformer || this.triggerTransformer
      this.completionItemPrefix = completionItemPrefix || this.completionItemPrefix
      this.completionItemSuffix = completionItemSuffix || this.completionItemSuffix

      if (triggerRegexp) {
        this.triggerRegexp = new RegExp(triggerRegexp, 'gi')
      }
      if (contentRegexp) {
        this.contentRegexp = new RegExp(contentRegexp, 'gim')
      }

      if (itemKind) {
        if (itemKind in CompletionItemKind) {
          // @ts-ignore
          this.itemKind = CompletionItemKind[itemKind]
        } else {
          throw new Error(`${errorPrefix} itemKind value '${itemKind}' is not allowed. It must be one of CompletionItemKind. See the documentation here: https://code.visualstudio.com/api/references/vscode-api#CompletionItemKind`)
        }
      }

      if (this.maxFiles <= 0) {
        throw new Error(`${errorPrefix} cannot set maxFiles to '${this.maxFiles}' since it's less than or equal to 0. If you want to disable a rule, just set enabled: false.`)
      }

      if (this.maxItems <= 0) {
        throw new Error(`${errorPrefix} cannot set maxItems to '${this.maxItems}' since it's less than or equal to 0. If you want to disable a rule, just set enabled: false.`)
      }

      if (this.maxItemsPerFile <= 0) {
        throw new Error(`${errorPrefix} cannot set maxItemsPerFile to '${this.maxItemsPerFile}' since it's less than or equal to 0. If you want to disable a rule, just set enabled: false.`)
      }

      if (!this.includeGlobPattern && this.staticItems.length === 0) {
        throw new Error(`${errorPrefix} you must either provide a includeGlobPattern or provide at least one of staticItems for this rule to be meaningful. If you want to disable a rule, just set enabled: false.`)
      }

      if ((this.includeGlobPattern && !this.contentRegexp) || (this.contentRegexp && !this.includeGlobPattern)) {
        throw new Error(`${errorPrefix} if you set includeGlobPattern, you must also set contentRegexp, otherwise the extension won't know how to extract completion items from files.`)
      }
    }
}
