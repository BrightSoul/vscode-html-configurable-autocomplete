const it = require('@jest/globals').it
const expect = require('@jest/globals').expect
const converter = require('../models/services/TransformedPositionConverter')

it('should return the transformed position when converting original to transformed', () => {
  // Arrange
  const originalPosition = { line: 2, character: 2 }
  const expectedTransformedPosition = { line: 1, character: 7 }
  const content = '0,3 foo\n2,1 bar'

  // Act
  const actualTransformedPosition = converter.convertOriginalToTransformed(content, originalPosition)

  // Assert
  expect(actualTransformedPosition).toStrictEqual(expectedTransformedPosition)
})

it('should return the transformed position when converting original to transformed with multiple definitions on the same line', () => {
  // Arrange
  const originalPosition = { line: 2, character: 7 }
  const expectedTransformedPosition = { line: 2, character: 8 }
  const content = '0,3 foo\n2,1 bar\n2,6 fizz\n2,13 buzz'

  // Act
  const actualTransformedPosition = converter.convertOriginalToTransformed(content, originalPosition)

  // Assert
  expect(actualTransformedPosition).toStrictEqual(expectedTransformedPosition)
})

it('should return the original position when converting transformed to original', () => {
  // Arrange
  const transformedPosition = { line: 1, character: 4 }
  const expectedOriginalPosition = { line: 2, character: 4 }
  const content = '0,3 foo\n2,4 bar'

  // Act
  const actualOriginalPosition = converter.convertTransformedToOriginal(content, transformedPosition)

  // Assert
  expect(actualOriginalPosition).toStrictEqual(expectedOriginalPosition)
})

it('should return the original position when converting transformed to original with multiple definitions on the same line', () => {
  // Arrange
  const transformedPosition = { line: 1, character: 6 }
  const expectedOriginalPosition = { line: 2, character: 1 }
  const content = '0,3 foo\n2,1 bar\n2,6 fizz\n2,13 buzz'

  // Act
  const actualOriginalPosition = converter.convertTransformedToOriginal(content, transformedPosition)

  // Assert
  expect(actualOriginalPosition).toStrictEqual(expectedOriginalPosition)
})
