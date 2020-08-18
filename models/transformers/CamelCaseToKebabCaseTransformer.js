const Logger = require('../services/Logger')
const TransformResult = require('./TransformResult')
const formatConverter = require('../services/FormatConverter')

module.exports = class CamelCaseToKebabCaseTransformer {
  /**
   * Transforms content from camel case to kebab case
   * @param {string} content
   * @param {string|undefined} [origin]
   * @returns {TransformResult}
   */
  static transformContent (content, origin) {
    if (!content) {
      Logger.debug(`Could not transform empty content from ${origin} from camel case to kebab case`)
      return new TransformResult(content)
    }

    const transformedContent = formatConverter.camelCaseToKebabCase(content)
    return new TransformResult(transformedContent)
  }
}
