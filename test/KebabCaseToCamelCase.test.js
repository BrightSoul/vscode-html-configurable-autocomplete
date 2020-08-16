const it = require('@jest/globals').it
const expect = require('@jest/globals').expect
const converter = require('../models/services/FormatConverter')
it('should convert kebab case to camel case', () => {
  // Arrange
  /**
   * @type {Object.<string, string>}
   */
  const data = {
    'foo-bar': 'fooBar',
    foo: 'foo',
    'foo-fizz-buzz': 'fooFizzBuzz',
    '': ''
  }

  // Act & Assert
  for (const content in data) {
    const actualResult = converter.kebabCaseToCamelCase(content)
    const expectedResult = data[content]
    expect(actualResult).toBe(expectedResult)
  }
})
