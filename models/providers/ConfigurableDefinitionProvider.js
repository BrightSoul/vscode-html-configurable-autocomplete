const vscode = require('vscode')
const PathProvider = require('../services/PathProvider')
const Logger = require('../services/Logger')
const fs = require('fs').promises

module.exports = class ConfigurableDefinitionProvider {
  /**
   * @type {import('../options/ConfigurableDefinitionOptions')}
   */
  options;

  /**
   * @param {import('../options/ConfigurableDefinitionOptions')} options
   */
  constructor (options) {
    this.options = options
  }

  /**
   * @param {vscode.TextDocument} document
   * @param {vscode.Position} position
   * @param {vscode.CancellationToken} token
   * @returns {Promise<vscode.Location|undefined>}
   */
  async provideDefinition (document, position, token) {
    const definitionName = this.getDefinitionName(document, position)
    if (!definitionName) {
      // Couldn't extract a definition name from current location, just return
      return
    }

    const definitionResult = await this.findDefinitionInFiles(definitionName, document, token)
    return definitionResult
  }

  /**
   * @param {vscode.TextDocument} document
   * @param {vscode.Position} position
   * @returns {string|undefined}
   */
  getDefinitionName (document, position) {
    const currentLine = document.lineAt(position.line)
    let match
    const regexp = new RegExp(this.options.definitionRegexp.source, this.options.definitionRegexp.flags)
    while ((match = regexp.exec(currentLine.text))) {
      if (position.character >= match.index && position.character <= match.index + match[0].length) {
        const definitionName = match[1] || match[0]
        return definitionName
      }
    }
  }

  /**
   *
   * @param {string} definitionName
   * @param {vscode.TextDocument} document
   * @param {vscode.CancellationToken} token
   * @returns {Promise<vscode.Location|undefined>}
   */
  async findDefinitionInFiles (definitionName, document, token) {
    const includeGlobPattern = PathProvider.replaceDocumentPathVariables(this.options.includeGlobPattern, document)
    const excludeGlobPattern = PathProvider.replaceDocumentPathVariables(this.options.excludeGlobPattern, document)
    if (!includeGlobPattern) {
      return
    }
    const results = await vscode.workspace.findFiles(includeGlobPattern, excludeGlobPattern, undefined, token)

    if (results.length === 0) {
      Logger.warn(`Couldn't find any file for include pattern ${includeGlobPattern} and exclude pattern ${excludeGlobPattern} in definition provider rule with definition regexp ${this.options.definitionRegexp}`)
      return
    }

    for (const result of results) {
      if (token.isCancellationRequested) {
        return
      }
      const content = await fs.readFile(result.fsPath)
      const textContent = content.toString()
      const regexp = new RegExp(this.options.contentRegexp.source, this.options.contentRegexp.flags)
      let match
      while ((match = regexp.exec(textContent))) {
        const resultName = match[1] || match[0]
        if (resultName !== definitionName) {
          continue
        }
        // What line? What character?
        const lines = textContent.substr(0, match.index).split('\n')

        const uri = vscode.Uri.file(result.fsPath)
        const position = new vscode.Position(lines.length - 1, lines[lines.length - 1].length)
        const location = new vscode.Location(uri, position)
        return location
      }
    }
  }
}
