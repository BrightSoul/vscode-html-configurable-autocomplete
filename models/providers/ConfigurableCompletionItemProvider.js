const vscode = require('vscode')
const fs = require('fs').promises
const PathProvider = require('../services/PathProvider')
const Transformer = require('../services/Transformer')
const Logger = require('../services/Logger')

module.exports = class ConfigurableCompletionItemProvider {
  /**
   * @type {import('../options/ConfigurableCompletionItemOptions')}
   */
  options;

  /**
   * @type {import('../services/ProviderRegistry')}
   */
  providerRegistry;

  /**
   *
   * @param {import('../options/ConfigurableCompletionItemOptions')} options
   * @param {import('../services/ProviderRegistry')} providerRegistry
   */
  constructor (options, providerRegistry) {
    this.options = options
    this.providerRegistry = providerRegistry
  }

  /**
   * @param {vscode.TextDocument} document
   * @param {vscode.Position} position
   * @param {vscode.CancellationToken} token
   * @returns {Promise<vscode.CompletionList|undefined>}
   */
  async provideCompletionItems (document, position, token) {
    if (!this.shouldPerformCompletion(document, position)) {
      return
    }

    const staticCompletionItems = this.getStaticCompletionItems()
    const fileCompletionItems = await this.findCompletionItemsInFiles(document, position, token)

    if (token.isCancellationRequested) {
      return
    }
    return new vscode.CompletionList([...staticCompletionItems, ...fileCompletionItems])
  }

  /**
   * @param {vscode.TextDocument} document
   * @param {vscode.Position} position
   * @returns {boolean}
   */
  shouldPerformCompletion (document, position) {
    const currentLine = document.lineAt(position.line)
    const currentCharacter = currentLine.text.charAt(position.character - 1)
    if (!this.options.triggerCharacters.includes(currentCharacter)) {
      // Skip because the last typed character is not one on the trigger characters
      return false
    }

    if (!this.options.triggerRegexp) {
      // No filtering provided, go ahead with completion
      return true
    }

    let relevantText = ''
    if (this.options.triggerTransformer) {
      const transformResult = Transformer.transformContent(this.options.triggerTransformer, document.getText(), document.uri.fsPath, position)
      const transformedPosition = transformResult.convertOriginalPositionToTransformedPosition(position)
      const contentLines = transformResult.content.split('\n')
      const transformedLine = contentLines[transformedPosition.line]
      relevantText = transformedLine.substr(0, transformedPosition.character)
      position = new vscode.Position(0, relevantText.length)
    } else {
      relevantText = currentLine.text.substr(0, position.character)
    }

    const regexp = new RegExp(this.options.triggerRegexp.source, this.options.triggerRegexp.flags)
    let match
    while ((match = regexp.exec(relevantText))) {
      if (position.character >= match.index && position.character <= (match.index + match[0].length)) {
        // The cursor is inside a match, let's go ahead with completion
        return true
      } else {
        Logger.debug(`Completion item trigger regexp '${this.options.triggerRegexp.source}' matched '${match[0]}' but that match was discarded because the editor cursor was not placed inside that match`)
      }
    }

    return false
  }

  /**
   * @return {Array<vscode.CompletionItem>}
   */
  getStaticCompletionItems () {
    return this.options.staticItems.map(item => new vscode.CompletionItem(item, this.options.itemKind))
  }

  /**
   * @param {vscode.TextDocument} document
   * @param {vscode.Position} position
   * @param {vscode.CancellationToken} token
   * @return {Promise<Array<vscode.CompletionItem>>}
   */
  async findCompletionItemsInFiles (document, position, token) {
    if (!this.options.includeGlobPattern || !this.options.contentRegexp) {
      return []
    }

    const includeGlobPattern = await PathProvider.replaceAllPathVariables(this.options.includeGlobPattern, this.providerRegistry, document, position, token)
    const excludeGlobPattern = await PathProvider.replaceAllPathVariables(this.options.excludeGlobPattern, this.providerRegistry, document, position, token)

    if (!includeGlobPattern) {
      return []
    }

    const results = await vscode.workspace.findFiles(includeGlobPattern, excludeGlobPattern, this.options.maxFiles, token)
    /**
     * @type {Array<vscode.CompletionItem>}
     */
    const completionList = []

    if (results.length === 0) {
      Logger.debug(`Couldn't find any file for include pattern ${includeGlobPattern} and exclude pattern ${excludeGlobPattern} in completion item rule with trigger characters ${this.options.triggerCharacters.join(',')}`)
      return completionList
    }

    for (const result of results) {
      try {
        if (token.isCancellationRequested) {
          break
        }
        const content = await fs.readFile(result.fsPath)
        const transformResult = Transformer.transformContent(this.options.contentTransformer, content.toString(), result.fsPath)

        let itemPerFileMaxCount = this.options.maxItemsPerFile
        let match
        const regexp = new RegExp(this.options.contentRegexp.source, this.options.contentRegexp.flags)
        while ((match = regexp.exec(transformResult.content)) && (itemPerFileMaxCount-- > 0) && (completionList.length <= this.options.maxItems)) {
          const itemText = match[1] || match[0]
          const transformedItemText = Transformer.transformContent(this.options.completionItemTransformer, itemText, itemText)
          const item = new vscode.CompletionItem(transformedItemText.content, this.options.itemKind)
          const snippet = new vscode.SnippetString()
          appendTextToSnippet(snippet, this.options.completionItemPrefix)
          appendTextToSnippet(snippet, transformedItemText.content)
          appendTextToSnippet(snippet, this.options.completionItemSuffix)
          item.insertText = snippet
          completionList.push(item)
        }
      } catch (error) {
        Logger.error(error)
      }
    }
    return completionList
  }
}

/**
 * @param {vscode.SnippetString} snippet
 * @param {string} text
 */
function appendTextToSnippet (snippet, text) {
  if (!text) {
    return
  }
  const parts = text.split('\t')
  for (let i = 0; i < parts.length; i++) {
    snippet.appendText(parts[i])
    if (i < parts.length - 1) {
      snippet.appendTabstop()
    }
  }
}
