// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const ConfigurableCompletionItemOptions = require('./models/options/ConfigurableCompletionItemOptions');
const ConfigurableDefinitionOptions = require('./models/options/ConfigurableDefinitionOptions');
const ConfigurableDefinitionProvider = require('./models/providers/ConfigurableDefinitionProvider');
const ConfigurableCompletionItemProvider = require('./models/providers/ConfigurableCompletionItemProvider');
const Logger = require('./models/services/Logger');

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

	try {
		const registeredCompletionItemProviders = registerCompletionItemProviders(completionItemOptions, disposableList);
		Logger.info(`Registered ${registeredCompletionItemProviders} completion item providers`);
		const registeredDefinitionProviders = registerDefinitionProviders(definitionOptions, disposableList);
		Logger.info(`Registered ${registeredDefinitionProviders} definition providers`);
	} catch (error) {
		Logger.error(`${error}`);
	}

	if (disposableList.length == 0) {
		Logger.warn(`Will not do anything since no (valid) rules for completionItemProviders and definitionProviders were set in the configuration.`);
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
	let counter = 0;

	if (!configurationRules || !Array.isArray(configurationRules)) {
		return counter;
	}

	configurationRules.forEach(configurationRule => {
		const options = new ConfigurableCompletionItemOptions(configurationRule);
		const disposable = vscode.languages.registerCompletionItemProvider({ scheme: 'file', language: 'html' }, new ConfigurableCompletionItemProvider(options), ...options.triggerCharacters);
		disposableList.push(disposable);
		counter++;
	});
	return counter;
}

/**
 * @param {Array<any>} configurationRules
 * @param {Array<vscode.Disposable>} disposableList 
 * @returns {number}
 */
function registerDefinitionProviders(configurationRules, disposableList) {
	let counter = 0;
	if (!configurationRules || !Array.isArray(configurationRules)) {
		return counter;
	}
	configurationRules.forEach(configurationRule => {
		const options = new ConfigurableDefinitionOptions(configurationRule);
		const disposable = vscode.languages.registerDefinitionProvider({ scheme: 'file', language: 'html'}, new  ConfigurableDefinitionProvider(options));
		disposableList.push(disposable);
		counter++;
	});
	return counter;
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
