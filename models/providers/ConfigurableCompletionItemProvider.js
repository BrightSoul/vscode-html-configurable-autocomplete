const vscode = require('vscode');
const fs = require('fs').promises;
const ConfigurableCompletionItemOptions = require('../options/ConfigurableCompletionItemOptions');

module.exports = class ConfigurableCompletionItemProvider {

	/**
	 * @type {ConfigurableCompletionItemOptions}
	 */
	options;

	/**
	 * 
	 * @param {ConfigurableCompletionItemOptions} options 
	 */
	constructor(options) {
		this.options = options;
	}

	/**
	 * @param {vscode.TextDocument} document 
	 * @param {vscode.Position} position 
	 * @param {vscode.CancellationToken} token 
	 * @param {vscode.CompletionContext} context 
	 * @returns {Promise<vscode.CompletionList|undefined>}
	 */
	async provideCompletionItems(document, position, token, context) {
		
		if (!this.shouldPerformCompletion(document, position)) {
			return;
		}

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

	/**
	 * 
	 * @param {vscode.CompletionItem} item 
	 * @param {vscode.CancellationToken} token 
	 * @returns {vscode.ProviderResult<vscode.CompletionItem>}
	 */
	resolveCompletionItem(item, token) {
		return;
	}

	
	/**
	 * @param {vscode.TextDocument} document 
	 * @param {vscode.Position} position 
	 * @returns {boolean}
	 */
	shouldPerformCompletion(document, position) {
		const currentLine = document.lineAt(position.line);
		const currentCharacter = currentLine.text.charAt(position.character-1);
		if (!this.options.triggerCharacters.includes(currentCharacter)) {
			//Skip because the last typed character is not one on the trigger characters
			return false;
		}
		
		if (!this.options.triggerRegexp) {
			//No filtering provided, go ahead with completion
			return true;
		}

		const regexp = new RegExp(this.options.triggerRegexp.source, this.options.triggerRegexp.flags);
		let match;
		while (match = regexp.exec(currentLine.text)) {
			if (position.character >= match.index && position.character <= (match.index + match[0].length)) {
				//The cursor is inside a match, let's go ahead with completion
				return true;
			}
		}
		
		return false;
	}

};