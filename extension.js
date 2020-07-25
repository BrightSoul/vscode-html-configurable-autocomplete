// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const path = require('path');
const fs = require('fs').promises;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	const configuration = vscode.workspace.getConfiguration('htmlConfigurableAutocomplete');

	
	//const disposable1 = vscode.languages.registerCompletionItemProvider({ scheme: 'file', language: 'html' }, new ConfigurableCompletionItemProvider(), '<');
	//const disposable2 = vscode.languages.registerDefinitionProvider({ scheme: 'file', language: 'html'}, new  ConfigurableDefinitionProvider());

	//Register hover provider
	//context.subscriptions.push(disposable1);
	//context.subscriptions.push(disposable2);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
