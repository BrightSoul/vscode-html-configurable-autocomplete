const Logger = require('../services/Logger')
const TransformResult = require('./TransformResult')
const formatConverter = require('../services/FormatConverter')

module.exports = class KebabCaseToCamelCaseTransformer {
  /**
   * Transforms content from kebab case to camel case
   * @param {string} content
   * @param {string|undefined} [origin]
   * @returns {TransformResult}
   */
  static transformContent (content, origin) {
    if (!content) {
      Logger.debug(`Could not transform empty content from ${origin} from kebab case to camel case`)
      return new TransformResult(content)
    }

    const transformedContent = formatConverter.kebabCaseToCamelCase(content)
    return new TransformResult(transformedContent)
  }
}
