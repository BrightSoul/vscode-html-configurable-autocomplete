const vscode = require('vscode')
const PathProvider = require('../services/PathProvider')
const Logger = require('../services/Logger')
const Transformer = require('../services/Transformer')
const fs = require('fs').promises

module.exports = class ConfigurableReferenceProvider {
  /**
   * @type {import('../options/ConfigurableReferenceOptions')}
   */
  options;

  /**
   * @param {import('../options/ConfigurableReferenceOptions')} options
   */
  constructor (options) {
    this.options = options
  }

  /**
   * @param {vscode.TextDocument} document
   * @param {vscode.Position} position
   * @param {vscode.ReferenceContext} context
   * @param {vscode.CancellationToken} token
   * @returns {Promise<Array<vscode.Location>|undefined>}
   */
  async provideReferences (document, position, context, token) {
    const referenceName = this.getReferenceName(document, position)
    if (!referenceName) {
      // Couldn't extract a definition name from current location, just return
      return
    }

    const referencesResult = await this.findReferencesInFiles(referenceName, document, token)
    return referencesResult
  }

  /**
   * @param {vscode.TextDocument} document
   * @param {vscode.Position} position
   * @returns {string|undefined}
   */
  getReferenceName (document, position) {
    const currentLine = document.lineAt(position.line)
    let match
    const regexp = new RegExp(this.options.referenceRegexp.source, this.options.referenceRegexp.flags)
    while ((match = regexp.exec(currentLine.text))) {
      if (position.character >= match.index && position.character <= match.index + match[0].length) {
        const definitionName = match[1] || match[0]
        return definitionName
      } else {
        Logger.debug(`Reference regexp '${this.options.referenceRegexp.source}' matched '${match[0]}' but that match was discarded because the editor cursor was not placed inside that match`)
      }
    }
  }

  /**
   *
   * @param {string} definitionName
   * @param {vscode.TextDocument} document
   * @param {vscode.CancellationToken} token
   * @returns {Promise<Array<vscode.Location>|undefined>}
   */
  async findReferencesInFiles (definitionName, document, token) {
    const includeGlobPattern = PathProvider.replaceDocumentPathVariables(this.options.includeGlobPattern, document)
    const excludeGlobPattern = PathProvider.replaceDocumentPathVariables(this.options.excludeGlobPattern, document)
    if (!includeGlobPattern) {
      return
    }
    const results = await vscode.workspace.findFiles(includeGlobPattern, excludeGlobPattern, this.options.maxFiles, token)

    if (results.length === 0) {
      Logger.debug(`Couldn't find any file for include pattern ${includeGlobPattern} and exclude pattern ${excludeGlobPattern} in reference provider rule with reference regexp ${this.options.referenceRegexp}`)
      return
    }

    /**
     * @type {Array<vscode.Location>}
     */
    const locations = []

    for (const result of results) {
      if (token.isCancellationRequested) {
        return
      }
      if (locations.length >= this.options.maxReferences) {
        break
      }
      const content = await fs.readFile(result.fsPath)
      //Transformers currently not supported in reference providers
      const transformResult = Transformer.transformContent('', content.toString(), result.fsPath)

      const regexp = new RegExp(this.options.contentRegexp.source, this.options.contentRegexp.flags)
      let match
      let referencesInFile = 0
      while ((match = regexp.exec(transformResult.content)) && referencesInFile <= this.options.maxReferencesPerFile) {
        const resultName = match[1] || match[0]
        if (resultName !== definitionName) {
          continue
        }
        // What line? What character?
        const lines = transformResult.content.substr(0, match.index).split('\n')

        const uri = vscode.Uri.file(result.fsPath)
        const position = transformResult.positionResolver(new vscode.Position(lines.length - 1, lines[lines.length - 1].length))
        const location = new vscode.Location(uri, position)
        locations.push(location)
        referencesInFile++
      }
    }

    return locations
  }
}
