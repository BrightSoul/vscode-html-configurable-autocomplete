const Logger = require('../services/Logger')
const TransformResult = require('./TransformResult')
const FlattenHtmlFormatter = require('../services/FlattenHtmlFormatter')
const TransformedPositionConverter = require('../services/TransformedPositionConverter')

module.exports = class FlattenHtmlTransformer {
  /**
   * Transforms content by flattening HTML nodes
   * @param {string} content
   * @param {string|undefined} [origin]
   * @param {import('vscode').Position|undefined} [caretPosition]
   * @returns {TransformResult}
   */
  static transformContent (content, origin, caretPosition) {
    if (!content) {
      Logger.debug(`Could not extract html nodes from empty content from ${origin}`)
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
    const output = FlattenHtmlFormatter.parseAndFormat(content)
    try {
      return new TransformResult(output, TransformResult.transformedToOriginalPositionConverter, TransformResult.originalToTransformedPositionConverter)
    } catch (error) {
      Logger.debug(`Could not extract nodes from HTML ${origin || content} because: ${error}`)
      return new TransformResult('')
    }
  }
}
