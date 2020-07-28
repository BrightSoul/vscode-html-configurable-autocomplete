const vscode = require('vscode');
const fs = require('fs').promises;
const ConfigurableCompletionItemOptions = require('../options/ConfigurableCompletionItemOptions');
const PathProvider = require('../services/PathProvider');
const Logger = require('../services/Logger');
const ProviderRegistry = require('../services/ProviderRegistry');

module.exports = class ConfigurableCompletionItemProvider {

	/**
	 * @type {ConfigurableCompletionItemOptions}
	 */
	options;

	/**
	 * @type {ProviderRegistry}
	 */
	providerRegistry;

	/**
	 * 
	 * @param {ConfigurableCompletionItemOptions} options 
	 * @param {ProviderRegistry} providerRegistry
	 */
	constructor(options, providerRegistry) {
		this.options = options;
		this.providerRegistry = providerRegistry;
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
		const fileCompletionItems = await this.findCompletionItemsInFiles(document, position, token);

		if (token.isCancellationRequested) {
			return;
		}
		return new vscode.CompletionList([...staticCompletionItems, ...fileCompletionItems]);
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
		const relevantText = currentLine.text.substr(0, position.character);
		let match;
		while (match = regexp.exec(relevantText)) {
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
	 * @param {vscode.Position} position 
	 * @param {vscode.CancellationToken} token 
	 * @return {Promise<Array<vscode.CompletionItem>>}
	 */
	async findCompletionItemsInFiles(document, position, token) {
		if (!this.options.includeGlobPattern || !this.options.contentRegexp) {
			return [];
		}

		const includeGlobPattern = await PathProvider.replaceAllPathVariables(this.options.includeGlobPattern, this.providerRegistry, document, position, token);
		const excludeGlobPattern = await PathProvider.replaceAllPathVariables(this.options.excludeGlobPattern, this.providerRegistry, document, position, token);

		if (!includeGlobPattern) {
			return [];
		}

		const results = await vscode.workspace.findFiles(includeGlobPattern, excludeGlobPattern, this.options.maxFiles, token);
		/**
		 * @type {Array<vscode.CompletionItem>}
		 */
		const completionList = [];

		if (results.length == 0) {
			Logger.warn(`Couldn't find any file for include pattern ${includeGlobPattern} and exclude pattern ${excludeGlobPattern} in completion item rule with trigger characters ${this.options.triggerCharacters.join(',')}`);
			return completionList;
		}

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
				Logger.error(error);
			}
		}
		return completionList;
	}
};