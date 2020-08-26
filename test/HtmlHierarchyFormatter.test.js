const it = require('@jest/globals').it
const expect = require('@jest/globals').expect
const HtmlHierarchyFormatter = require('../models/services/HtmlHierarchyFormatter')
const { Parser } = require('htmlparser2')

it('should format HTML container elements', () => {
  // Arrange
  const content = '<div><span></span></div>'
  const expectedOutput = '0,0 <div>\n0,5 <div><span>'

  // Act
  const actualOutput = parseAndFormat(content)

  // Assert
  expect(actualOutput).toBe(expectedOutput)
})

it('should format HTML container elements with attributes', () => {
  // Arrange
  const content = '<div foo="bar"><span fizz="buzz"></span></div>'
  const expectedOutput = '0,0 <div foo="bar">\n0,15 <div foo="bar"><span fizz="buzz">'

  // Act
  const actualOutput = parseAndFormat(content)

  // Assert
  expect(actualOutput).toBe(expectedOutput)
})

it('should format HTML container elements with attributes and inconsistent newlines', () => {
  // Arrange
  const content = '<div foo="bar">\r\n<span fizz="buzz">\n</span>\r\n<hr>\n<article hey="wow"></article></div>'
  const expectedOutput = '0,0 <div foo="bar">\n1,0 <div foo="bar"><span fizz="buzz">\n3,0 <div foo="bar"><hr>\n4,0 <div foo="bar"><article hey="wow">'

  // Act
  const actualOutput = parseAndFormat(content)

  // Assert
  expect(actualOutput).toBe(expectedOutput)
})

it('should format HTML container elements with broken content', () => {
  // Arrange
  const content = '<div foo="bar"><span fizz="{{</div>'
  const expectedOutput = '0,0 <div foo="bar">'

  // Act
  const actualOutput = parseAndFormat(content)

  // Assert
  expect(actualOutput).toBe(expectedOutput)
})

/**
 * @param {string} content
 */
function parseAndFormat (content) {
  const formatter = new HtmlHierarchyFormatter(content)
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

  // Act
  parser.write(content)
  parser.end()
  return formatter.getOutput()
}
