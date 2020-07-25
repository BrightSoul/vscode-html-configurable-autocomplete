module.exports = class ConfigurableAutocompleteItemProvider {
	async provideCompletionItems(document, position, token, context) {
		
		const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
		const workspaceFolderPath = workspaceFolder.uri.path;

		const globPattern = new vscode.RelativePattern(workspaceFolder, '*.*');
		//const results = await vscode.workspace.findFiles(globPattern, null, 10, token);
		//const results = await vscode.workspace.findFiles('**/*', null, 10, token);
		const results = await vscode.workspace.findFiles('**/*.txt', '**/node_modules/**');
		//vscode.workspace.createFileSystemWatcher();
		const completionList = [];
		for(let result of results) {
			try {
			const content = await fs.readFile(result.fsPath);
			const stringContent = content.toString();
			const lines = stringContent.split("\n");
			for (let line of lines) {
				if (line) {
					const item = new vscode.CompletionItem(line, vscode.CompletionItemKind.Property);
					item.detail = "Nome del tag";
					completionList.push(item);			
				}
			}
		} catch (e)
		 {
const b = e;
		}
		}

		const list = new vscode.CompletionList(completionList);
		return list;
	}

	resolveCompletionItem(item, token) {
		return //PRoviderREsult
	}

};