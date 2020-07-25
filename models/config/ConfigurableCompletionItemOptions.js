module.exports = class ConfigurableCompletionItemOptions {
    constructor() {
        this.enable = true;
    }
    /**
     * @type {boolean}
     */
    enable;

    /**
     * @type {string}
     */
    triggerCharacters;

    /**
     * @type {string}
     */
    triggerPattern;

    /**
     * @type {number}
     */
    maxFiles;

    /**
     * @type {number}
     */
    maxItems;

    /**
     * @type {number}
     */
    maxItemsPerFile;

    /**
     * @type {string}
     */
    itemKind;

    /**
     * @type {string}
     */
    includeGlobPattern;

    /**
     * @type {string}
     */
    excludeGlobPattern;

    /**
     * @type {string}
     */
    contentPattern;

    /**
     * @type {Array<string>}
     */
    staticItems;
};