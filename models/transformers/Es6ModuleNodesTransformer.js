const parse = require('babel-eslint/lib/parse')
const Logger = require('../services/Logger')
const TransformResult = require('./TransformResult')
const NodesFormatter = require('../services/NodesFormatter');
const vscode = require('vscode')

module.exports = class Es6ModuleNodesTransformer {
  /**
   * Transforms content by extracting tokens from ES6 modules
   * @param {string} content
   * @param {string|undefined} origin
   * @returns {TransformResult}
   */
  static transformContent (content, origin) {
    if (!content) {
      return new TransformResult(content)
    }

    try {
      const file = parse(content, { ecmaVersion: 2020, sourceType: 'module' })
      const transformedContent = NodesFormatter.formatNodes(file.program.body)
      return new TransformResult(transformedContent, Es6ModuleNodesTransformer.positionResolver)
    } catch (error) {
      Logger.debug(`Could not extract tokens from ES6 Module '${origin || content}' because: ${error}`)
      return new TransformResult(content)
    }
  }

  /**
   * @param {string} content
   * @param {vscode.Position} position
   * @returns {vscode.Position}
   */
  static positionResolver (content, position) {
    const lines = content.split('\n')
    if (position.line >= lines.length - 1) {
      Logger.error("Couldn't resolve original position")
      return position
    }
    const originalPositionValues = lines[position.line].split('\t')[0].split(',')
    if (originalPositionValues.length < 2) {
      Logger.error("Couldn't resolve original position")
      return position
    }

    const originalPosition = new vscode.Position(+originalPositionValues[0], +originalPositionValues[1])
    return originalPosition
  }
}
