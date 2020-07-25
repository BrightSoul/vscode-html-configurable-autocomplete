module.exports = class ConfigurableDefinitionProvider {
	provideDefinition(document, position, token) {
		const uri = vscode.Uri.file('');
		const pos = new vscode.Position(0, 0);
		return new vscode.Location(uri, pos);
	}
};