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
        const transformedDefinitionName = Transformer.transformContent(this.options.definitionTransformer, definitionName, currentLine.text)
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
