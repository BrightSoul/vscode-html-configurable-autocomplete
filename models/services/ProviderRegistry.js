const vscode = require('vscode')
const ConfigurableDefinitionOptions = require('../options/ConfigurableDefinitionOptions')
const ConfigurableDefinitionProvider = require('../providers/ConfigurableDefinitionProvider')
const ConfigurableCompletionItemOptions = require('../options/ConfigurableCompletionItemOptions')
const ConfigurableCompletionItemProvider = require('../providers/ConfigurableCompletionItemProvider')
const ConfigurableReferenceOptions = require('../options/ConfigurableReferenceOptions')
const ConfigurableReferenceProvider = require('../providers/ConfigurableReferenceProvider')
const htmlFileScheme = { scheme: 'file', language: 'html' }
const jsFileScheme = { scheme: 'file', language: 'javascript' }

module.exports = class ProviderRegistry {
    /**
     * @type {Map<any, vscode.Disposable>}
     */
    disposables = new Map();

    /**
     * @type {Array<ConfigurableDefinitionProvider>}
     */
    definitionProviders = [];

    /**
     * @type {Array<ConfigurableCompletionItemProvider>}
     */
    completionItemProviders = [];

    /**
     * @type {Array<ConfigurableReferenceProvider>}
     */
    referenceProviders = [];

    /**
     * @type {vscode.ExtensionContext|undefined} context
     */
    context;

    /**
     * @param {Array<any>} configurationRules
     */
    registerCompletionItemProviders (configurationRules) {
      if (!configurationRules || !Array.isArray(configurationRules)) {
        return
      }

      configurationRules.forEach(configurationRule => {
        const options = new ConfigurableCompletionItemOptions(configurationRule)
        if (!options.enable) {
          return
        }
        const provider = new ConfigurableCompletionItemProvider(options, this)
        this.completionItemProviders.push(provider)
        const disposable = vscode.languages.registerCompletionItemProvider(htmlFileScheme, provider, ...options.triggerCharacters)
        this.disposables.set(provider, disposable)
        if (this.context) this.context.subscriptions.push(disposable)
      })
    }

    /**
     * Keeps a reference to the context
     * @param {vscode.ExtensionContext} context
     */
    setContext (context) {
      this.context = context
    }

    /**
     * @param {Array<any>} configurationRules
     */
    registerDefinitionProviders (configurationRules) {
      if (!configurationRules || !Array.isArray(configurationRules)) {
        return
      }

      configurationRules.forEach(configurationRule => {
        const options = new ConfigurableDefinitionOptions(configurationRule)
        if (!options.enable) {
          return
        }
        const provider = new ConfigurableDefinitionProvider(options)
        this.definitionProviders.push(provider)
        const disposable = vscode.languages.registerDefinitionProvider(htmlFileScheme, provider)
        this.disposables.set(provider, disposable)
        if (this.context) this.context.subscriptions.push(disposable)
      })
    }

    /**
     * @param {Array<any>} configurationRules
     */
    registerReferenceProviders (configurationRules) {
      if (!configurationRules || !Array.isArray(configurationRules)) {
        return
      }

      configurationRules.forEach(configurationRule => {
        const options = new ConfigurableReferenceOptions(configurationRule)
        if (!options.enable) {
          return
        }
        const provider = new ConfigurableReferenceProvider(options)
        this.referenceProviders.push(provider)
        const disposable = vscode.languages.registerReferenceProvider(jsFileScheme, provider)
        this.disposables.set(provider, disposable)
        if (this.context) this.context.subscriptions.push(disposable)
      })
    }

    /**
     * Removes all registered providers
     */
    clearAllProviders () {
      const providers = [...this.completionItemProviders, ...this.definitionProviders, ...this.referenceProviders]
      providers.forEach(provider => {
        const disposable = this.disposables.get(provider)
        if (disposable) {
          if (this.context) {
            const disposableIndex = this.context.subscriptions.indexOf(disposable)
            if (disposableIndex >= 0) {
              this.context.subscriptions.splice(disposableIndex, 1)
            }
          }
          disposable.dispose()
        }
      })
      this.disposables.clear()
      this.completionItemProviders = []
      this.definitionProviders = []
      this.referenceProviders = []
    }
}
