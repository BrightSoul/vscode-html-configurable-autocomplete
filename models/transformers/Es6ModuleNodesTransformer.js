const parse = require('babel-eslint/lib/parse')
const Logger = require('../services/Logger')
const TransformResult = require('./TransformResult')
const JsNodesFormatter = require('../services/JsNodesFormatter')

module.exports = class Es6ModuleNodesTransformer {
  /**
   * Transforms content by extracting tokens from ES6 modules
   * @param {string} content
   * @param {string|undefined} [origin]
   * @returns {TransformResult}
   */
  static transformContent (content, origin) {
    if (!content) {
      Logger.debug(`Could not extract module nodes from empty content from ${origin}`)
      return new TransformResult(content)
    }

    try {
      const file = parse(content, { ecmaVersion: 2020, sourceType: 'module' })
      const transformedContent = JsNodesFormatter.formatNodes(file)
      return new TransformResult(transformedContent, TransformResult.transformedToOriginalPositionConverter, TransformResult.originalToTransformedPositionConverter)
    } catch (error) {
      Logger.debug(`Could not extract nodes from ES6 Module ${origin || content} because: ${error}`)
      return new TransformResult('')
    }
  }
}
