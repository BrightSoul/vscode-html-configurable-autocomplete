const it = require('@jest/globals').it
const expect = require('@jest/globals').expect
const FlattenHtmlFormatter = require('../models/services/FlattenHtmlFormatter')

it('should format HTML container elements', () => {
  // Arrange
  const content = '<div><span></span></div>'
  const expectedOutput = '0,0 <div>\n0,5 <div><span>'

  // Act
  const actualOutput = FlattenHtmlFormatter.parseAndFormat(content)

  // Assert
  expect(actualOutput).toBe(expectedOutput)
})

it('should format HTML container elements with attributes', () => {
  // Arrange
  const content = '<div foo="bar"><span fizz="buzz"></span></div>'
  const expectedOutput = '0,0 <div foo="bar">\n0,15 <div foo="bar"><span fizz="buzz">'

  // Act
  const actualOutput = FlattenHtmlFormatter.parseAndFormat(content)

  // Assert
  expect(actualOutput).toBe(expectedOutput)
})

it('should format HTML container elements with attributes and inconsistent newlines', () => {
  // Arrange
  const content = '<div foo="bar">\r\n<span fizz="buzz">\n</span>\r\n<hr>\n<article hey="wow"></article></div>'
  const expectedOutput = '0,0 <div foo="bar">\n1,0 <div foo="bar"><span fizz="buzz">\n3,0 <div foo="bar"><hr>\n4,0 <div foo="bar"><article hey="wow">'

  // Act
  const actualOutput = FlattenHtmlFormatter.parseAndFormat(content)

  // Assert
  expect(actualOutput).toBe(expectedOutput)
})

it('should format HTML container elements with broken content', () => {
  // Arrange
  const content = '<div foo="bar"><span fizz="{{</div>'
  const expectedOutput = '0,0 <div foo="bar">'

  // Act
  const actualOutput = FlattenHtmlFormatter.parseAndFormat(content)

  // Assert
  expect(actualOutput).toBe(expectedOutput)
})

it('should format HTML container elements with text', () => {
  // Arrange
  const content = '<div foo="bar">\n <span fizz="buzz">Hey yo!</span>\n</div>'
  const expectedOutput = '0,0 <div foo="bar">\n1,1 <div foo="bar"><span fizz="buzz">\n1,19 <div foo="bar"><span fizz="buzz">Hey yo!'

  // Act
  const actualOutput = FlattenHtmlFormatter.parseAndFormat(content)

  // Assert
  expect(actualOutput).toBe(expectedOutput)
})
