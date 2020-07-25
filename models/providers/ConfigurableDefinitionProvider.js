const vscode = require('vscode');
const ConfigurableDefinitionOptions = require('../options/ConfigurableDefinitionOptions');

module.exports = class ConfigurableDefinitionProvider {

	/**
	 * @type {ConfigurableDefinitionOptions}
	 */
	options;

	/**
	 * @param {ConfigurableDefinitionOptions} options 
	 */
	constructor(options) {
		this.options = options;
	}
	/**
	 * @param {vscode.TextDocument} document 
	 * @param {vscode.Position} position 
	 * @param {vscode.CancellationToken} token 
	 */
	provideDefinition(document, position, token) {
		const uri = vscode.Uri.file('');
		const pos = new vscode.Position(0, 0);
		return new vscode.Location(uri, pos);
	}
};