const Logger = require('../services/Logger')
const TransformResult = require('./TransformResult')
const FlattenJsonFormatter = require('../services/FlattenJsonFormatter')
const TransformedPositionConverter = require('../services/TransformedPositionConverter')

module.exports = class FlattenJsonTransformer {
  /**
   * Transforms content by flattening JSON nodes
   * @param {string} content
   * @param {string|undefined} [origin]
   * @param {import('vscode').Position|undefined} [caretPosition]
   * @returns {TransformResult}
   */
  static transformContent (content, origin, caretPosition) {
    if (!content) {
      Logger.debug(`Could not extract json nodes from empty content from ${origin}`)
      return new TransformResult(content)
    }
    if (caretPosition) {
      const lines = content.split('\n')
      const prefix = lines[caretPosition.line].substr(0, caretPosition.character)
      const suffix = lines[caretPosition.line].substr(caretPosition.character)
      const caretIndicator = TransformedPositionConverter.caretIndicator
      lines[caretPosition.line] = `${prefix}${caretIndicator}${suffix}`
      content = lines.join('\n')
    }
    const output = FlattenJsonFormatter.parseAndFormat(content)
    try {
      return new TransformResult(output, TransformResult.transformedToOriginalPositionConverter, TransformResult.originalToTransformedPositionConverter)
    } catch (error) {
      Logger.debug(`Could not extract nodes from JSON ${origin || content} because: ${error}`)
      return new TransformResult('')
    }
  }
}
