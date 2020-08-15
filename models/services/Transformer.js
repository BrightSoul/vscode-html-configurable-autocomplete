const Logger = require('./Logger')
const Es6ModuleNodesTransformer = require('../transformers/Es6ModuleNodesTransformer')
const TransformResult = require('../transformers/TransformResult')

/**
 * @type {Object.<string, {transformContent: (content: string, origin: string|undefined) => TransformResult}>}
 */
const transformerMap = {
  'es6-module-nodes': Es6ModuleNodesTransformer
}

module.exports = class Transformer {
  /**
   * Transforms content with the given transformer name
   * @param {string|undefined} transformerName
   * @param {string} content
   * @param {string|undefined} origin
   * @returns {TransformResult}
   */
  static transformContent (transformerName, content, origin) {
    if (!transformerName) {
      return new TransformResult(content)
    }
    if (!(transformerName in transformerMap)) {
      Logger.warn(`Transformer name '${transformerName}' is not supported`)
      return new TransformResult(content)
    }
    const transformer = transformerMap[transformerName]
    const transformedContent = transformer.transformContent(content, origin)
    Logger.debug(`Content from '${origin || content}' was transformed to:\n${transformedContent.content}`)
    return transformedContent
  }
}
