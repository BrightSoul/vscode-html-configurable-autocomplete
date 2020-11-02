const vscode = require('vscode')
const PathProvider = require('../services/PathProvider')
const Logger = require('../services/Logger')
const Transformer = require('../services/Transformer')
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
    const currentLine = document.lineAt(position.line)
    return this.provideDefinitionByText(document, currentLine.text, position.character, token)
  }

  /**
   * @param {vscode.TextDocument} document
   * @param {string|undefined} text
   * @param {number} character
   * @param {vscode.CancellationToken} token
   * @returns {Promise<vscode.Location|undefined>}
   */
  async provideDefinitionByText (document, text, character, token) {
    if (!text) {
      return undefined
    }

    const definitionName = this.getDefinitionName(text, character)
    if (!definitionName) {
      // Couldn't extract a definition name from current location, just return
      return
    }

    const definitionResult = await this.findDefinitionInFiles(definitionName, document, token)
    return definitionResult
  }

  /**
   * @param {string} line
   * @param {number} character
   * @returns {string|undefined}
   */
  getDefinitionName (line, character) {
    let match
    const regexp = new RegExp(this.options.definitionRegexp.source, this.options.definitionRegexp.flags)
    while ((match = regexp.exec(line))) {
      if (character >= match.index && character <= match.index + match[0].length) {
        const definitionName = match[1] || match[0]
        const transformedDefinitionName = Transformer.transformContent(this.options.definitionTransformer, definitionName, line)
        return transformedDefinitionName.content
      } else {
        Logger.debug(`Definition regexp '${this.options.definitionRegexp.source}' matched '${match[0]}' but that match was discarded because the editor cursor was not placed inside that match`)
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
      Logger.debug(`Couldn't find any file for include pattern ${includeGlobPattern} and exclude pattern ${excludeGlobPattern} in definition provider rule with definition regexp ${this.options.definitionRegexp}`)
      return
    }

    for (const result of results) {
      if (token.isCancellationRequested) {
        return
      }
      const content = await fs.readFile(result.fsPath)
      const transformResult = Transformer.transformContent(this.options.contentTransformer, content.toString(), result.fsPath)

      const regexp = new RegExp(this.options.contentRegexp.source, this.options.contentRegexp.flags)
      let match
      while ((match = regexp.exec(transformResult.content))) {
        const resultName = match[1] || match[0]
        if (resultName !== definitionName) {
          continue
        }
        // What line? What character?
        const lines = transformResult.content.substr(0, match.index).split('\n')

        const uri = vscode.Uri.file(result.fsPath)
        const transformedPosition = new vscode.Position(lines.length - 1, lines[lines.length - 1].length)
        const originalPosition = transformResult.convertTransformedPositionToOriginalPosition(transformedPosition)
        const location = new vscode.Location(uri, originalPosition)
        return location
      }
    }
  }
}
