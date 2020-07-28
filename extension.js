// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const providerRegistry = require('./models/services/ProviderRegistry');
const Logger = require('./models/services/Logger');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	vscode.workspace.onDidChangeConfiguration(onConfigurationChanged);
	providerRegistry.setContext(context);
	registerProviders();
}
exports.activate = activate;

/**
 * Re-registers providers
 * @param {vscode.ConfigurationChangeEvent} event 
 */
function onConfigurationChanged(event) {
	if (!event.affectsConfiguration('htmlConfigurableAutocomplete')) {
		return;
	}
	Logger.info(`Configuration updated, re-registering providers.`);
	registerProviders();
}

function registerProviders() {
	const configuration = vscode.workspace.getConfiguration('htmlConfigurableAutocomplete');

	providerRegistry.clearAllProviders();

	if (configuration.enable === false) {
		Logger.warn(`The extension is disabled by configuration and won't do anything`);
		return;
	}
	const completionItemOptions = configuration.completionItemProviders;
	const definitionOptions = configuration.definitionProviders;

	try {
		providerRegistry.registerCompletionItemProviders(completionItemOptions);
		Logger.info(`Registered ${providerRegistry.completionItemProviders.length} completion item providers`);
		providerRegistry.registerDefinitionProviders(definitionOptions);
		Logger.info(`Registered ${providerRegistry.definitionProviders.length} definition providers`);
	} catch (error) {
		Logger.error(`${error}`);
	}

	if (providerRegistry.completionItemProviders.length + providerRegistry.definitionProviders.length == 0) {
		Logger.warn(`Will not do anything since no (valid) rules for completionItemProviders and definitionProviders were set in the configuration.`);
		return;
	}
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
