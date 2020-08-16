const it = require('@jest/globals').it
const expect = require('@jest/globals').expect
const converter = require('../models/services/FormatConverter')
it('should convert camel case to kebab case', () => {
  // Arrange
  /**
   * @type {Object.<string, string>}
   */
  const data = {
    fooBar: 'foo-bar',
    FooBar: 'foo-bar',
    foo: 'foo',
    Foo: 'foo',
    FFizzBuzz: 'ffizz-buzz',
    fooFizzBuzz: 'foo-fizz-buzz',
    FooFizzBuzz: 'foo-fizz-buzz',
    '': ''
  }

  // Act & Assert
  for (const content in data) {
    const actualResult = converter.camelCaseToKebabCase(content)
    const expectedResult = data[content]
    expect(actualResult).toBe(expectedResult)
  }
})
