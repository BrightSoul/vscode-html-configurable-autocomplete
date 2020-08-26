const { Parser } = require('htmlparser2')
const Logger = require('../services/Logger')
const TransformResult = require('./TransformResult')
const HtmlFormatter = require('../services/HtmlHierarchyFormatter')

module.exports = class HtmlHierarchyTransformer {
  /**
   * Transforms content by extracting tokens from ES6 modules
   * @param {string} content
   * @param {string|undefined} [origin]
   * @returns {TransformResult}
   */
  static transformContent (content, origin) {
    if (!content) {
      Logger.debug(`Could not extract html nodes from empty content from ${origin}`)
      return new TransformResult(content)
    }

    try {
      const formatter = new HtmlFormatter(content)
      /**
       * @type {any}
       */
      let parser = null
      parser = new Parser(
        {
          onopentag () {
            formatter.push(parser.startIndex, parser.endIndex)
          },
          onclosetag () {
            formatter.pop()
          }
        },
        { decodeEntities: true }
      )
      parser.write(content)
      parser.end()
      return new TransformResult(formatter.getOutput(), TransformResult.transformedToOriginalPositionConverter, TransformResult.originalToTransformedPositionConverter)
    } catch (error) {
      Logger.debug(`Could not extract nodes from HTML ${origin || content} because: ${error}`)
      return new TransformResult('')
    }
  }
}
