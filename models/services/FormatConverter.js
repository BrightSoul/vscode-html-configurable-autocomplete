module.exports = class FormatConverter {
  /**
   * @param {string} input
   * @return {string}
   */
  static camelCaseToKebabCase (input) {
    return (input || '').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
  }
}
