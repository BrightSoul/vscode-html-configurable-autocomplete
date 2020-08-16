module.exports = class FormatConverter {
  /**
   * @param {string} input
   * @return {string}
   */
  static camelCaseToKebabCase (input) {
    return (input || '').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
  }

  /**
   * @param {string} input
   * @return {string}
   */
  static kebabCaseToCamelCase (input) {
    return (input || '').replace(/-(\w)/g, a => a.substr(1).toUpperCase())
  }
}
