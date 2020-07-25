const vscode = require('vscode');
const path = require('path');
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

		const staticCompletionItems = this.getStaticCompletionItems();
		const fileCompletionItems = await this.findCompletionItemsInFiles(document, token);

		if (token.isCancellationRequested) {
			return;
		}
		return new vscode.CompletionList([...staticCompletionItems, ...fileCompletionItems]);
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
		const currentCharacter = currentLine.text.charAt(position.character - 1);
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

	/**
	 * @return {Array<vscode.CompletionItem>}
	 */
	getStaticCompletionItems() {
		return this.options.staticItems.map(item => new vscode.CompletionItem(item, this.options.itemKind));
	}

	/**
	 * @param {vscode.TextDocument} document 
	 * @param {vscode.CancellationToken} token 
	 * @return {Promise<Array<vscode.CompletionItem>>}
	 */
	async findCompletionItemsInFiles(document, token) {
		if (!this.options.includeGlobPattern || !this.options.contentRegexp) {
			return [];
		}

		const includeGlobPattern = this.replaceVariablesInPattern(this.options.includeGlobPattern, document);
		const excludeGlobPattern = this.replaceVariablesInPattern(this.options.excludeGlobPattern, document);
		if (!includeGlobPattern) {
			return [];
		}
		const results = await vscode.workspace.findFiles(includeGlobPattern, excludeGlobPattern, this.options.maxFiles, token);
		/**
		 * @type {Array<vscode.CompletionItem>}
		 */
		const completionList = [];
		for (const result of results) {
			try {
				if (token.isCancellationRequested) {
					break;
				}
				const content = await fs.readFile(result.fsPath);
				const contentText = content.toString();

				let itemPerFileMaxCount = this.options.maxItemsPerFile;
				let match;
				const regexp = new RegExp(this.options.contentRegexp.source, this.options.contentRegexp.flags);
				while((match = regexp.exec(contentText)) && (itemPerFileMaxCount-- > 0) && (completionList.length <= this.options.maxItems)) {
					let itemText = match[1] || match[0];
					const item = new vscode.CompletionItem(itemText, this.options.itemKind);
					completionList.push(item);
				}
			} catch (error) {
				console.log(error);
			}
		}
		return completionList;
	}

	/**
	 * @param {string|undefined} pattern
	 * @param {vscode.TextDocument} document
	 */
	replaceVariablesInPattern(pattern, document) {
		if (!pattern) {
			return undefined;
		}
		const workspaceDir = vscode.workspace.getWorkspaceFolder(document.uri);
		if (!workspaceDir) {
			return pattern;
		}
		const fsPath = document.uri.fsPath;
		const dirName = path.basename(path.relative(workspaceDir.uri.fsPath, path.dirname(fsPath)));
		const fileName = path.basename(fsPath);
		let dirPath = (path.relative(workspaceDir.uri.fsPath, fsPath.substr(0, fsPath.length - fileName.length)).replace(/\\/g, '/') + '/');
		if (dirPath.substr(0, 1) == '/') {
			dirPath = dirPath.substr(1);
		}
		const filePath = path.relative(workspaceDir.uri.fsPath, fsPath).replace(/\\/g, '/');
		const fileNameWithoutExtension = fileName.substr(0, fileName.length - path.extname(fileName).length);
		return pattern
				.replace('${dirName}', dirName)
				.replace('${dirPath}', dirPath)
				.replace('${filePath}', filePath)
				.replace('${fileName}', fileName)
				.replace('${fileNameWithoutExtension}', fileNameWithoutExtension);
	}
};