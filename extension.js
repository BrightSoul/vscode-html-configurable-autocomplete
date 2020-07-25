// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const ConfigurableCompletionItemOptions = require('./models/options/ConfigurableCompletionItemOptions');
const ConfigurableDefinitionOptions = require('./models/options/ConfigurableDefinitionOptions');
const ConfigurableDefinitionProvider = require('./models/providers/ConfigurableDefinitionProvider');
const ConfigurableCompletionItemProvider = require('./models/providers/ConfigurableCompletionItemProvider');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	const configuration = vscode.workspace.getConfiguration('htmlConfigurableAutocomplete');
	if (configuration.enable === false) {
		return;
	}
	const completionItemOptions = configuration.completionItemProviders;
	const definitionOptions = configuration.definitionProviders;

	/**
	 * @type {Array<vscode.Disposable>}
	 */
	const disposableList = [];
	const prefix = "[HTML Configurable Autocomplete]";

	try {
		registerCompletionItemProviders(completionItemOptions, disposableList);
		registerDefinitionProviders(definitionOptions, disposableList);
	} catch (error) {
		console.error(`${prefix} ${error}`);
	}

	if (disposableList.length == 0) {
		console.warn(`${prefix} Will not do anything since completionItemProviders nor definitionProviders were properly set in the configuration.`);
		return;
	}
	context.subscriptions.push(...disposableList);
}
exports.activate = activate;

/**
 * @param {Array<any>} configurationRules
 * @param {Array<vscode.Disposable>} disposableList 
 */
function registerCompletionItemProviders(configurationRules, disposableList) {
	if (!configurationRules || !Array.isArray(configurationRules)) {
		return;
	}

	configurationRules.forEach(configurationRule => {
		const options = new ConfigurableCompletionItemOptions(configurationRule);
		const disposable = vscode.languages.registerCompletionItemProvider({ scheme: 'file', language: 'html' }, new ConfigurableCompletionItemProvider(options), ...options.triggerCharacters);
		disposableList.push(disposable);
	});

}

/**
 * @param {Array<any>} configurationRules
 * @param {Array<vscode.Disposable>} disposableList 
 */
function registerDefinitionProviders(configurationRules, disposableList) {
	if (!configurationRules || !Array.isArray(configurationRules)) {
		return;
	}
	configurationRules.forEach(configurationRule => {
		const options = new ConfigurableDefinitionOptions(configurationRule);
		const disposable = vscode.languages.registerDefinitionProvider({ scheme: 'file', language: 'html'}, new  ConfigurableDefinitionProvider(options));
		disposableList.push(disposable);
	});

}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
