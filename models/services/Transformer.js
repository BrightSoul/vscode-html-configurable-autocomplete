const Logger = require('./Logger')
const Es6ModuleNodesTransformer = require('../transformers/Es6ModuleNodesTransformer')
const CamelCaseToKebabCaseTransformer = require('../transformers/CamelCaseToKebabCaseTransformer')
const FlattenHtmlTransformer = require('../transformers/FlattenHtmlTransformer')
const FlattenJsonTransformer = require('../transformers/FlattenJsonTransformer')
const TransformResult = require('../transformers/TransformResult')
const KebabCaseToCamelCaseTransformer = require('../transformers/KebabCaseToCamelCaseTransformer')

/**
 * @type {Object.<string, {transformContent: (content: string, origin: string|undefined, caretPosition: import('vscode').Position|undefined) => TransformResult}>}
 */
const transformerMap = {
  'es6-module-nodes': Es6ModuleNodesTransformer,
  'camelcase-to-kebabcase': CamelCaseToKebabCaseTransformer,
  'kebabcase-to-camelcase': KebabCaseToCamelCaseTransformer,
  'flatten-html': FlattenHtmlTransformer,
  'flatten-json': FlattenJsonTransformer
}

module.exports = class Transformer {
  /**
   * Transforms content with the given transformer name
   * @param {string|undefined} transformerName
   * @param {string} content
   * @param {string|undefined} origin
   * @param {import('vscode').Position} [caretPosition]
   * @returns {TransformResult}
   */
  static transformContent (transformerName, content, origin, caretPosition) {
    if (!transformerName) {
      return new TransformResult(content)
    }
    if (!(transformerName in transformerMap)) {
      Logger.warn(`Transformer name '${transformerName}' is not supported`)
      return new TransformResult(content)
    }
    const transformer = transformerMap[transformerName]
    const transformedContent = transformer.transformContent(content, origin, caretPosition)
    Logger.debug(`Content from ${origin || content} was transformed to:\n${transformedContent.content}`)
    return transformedContent
  }
}
