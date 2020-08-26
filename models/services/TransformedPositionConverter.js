module.exports = class TransformedPositionConverter {
  /**
   * @param {string} content
   * @param {{line: number, character: number}} originalPosition
   * @return {{line: number, character: number}|undefined}
   */
  static convertOriginalToTransformed (content, originalPosition) {
    if (!content) {
      return undefined
    }
    const lines = content.split('\n')
    const coordinates = lines
      .map(line => { return { line, position: getPositionFromLine(line) } })
      .filter(entry => entry.position.line === originalPosition.line && entry.position.character <= originalPosition.character)
      .sort((a, b) => Math.sign(b.position.character - a.position.character))

    if (coordinates.length === 0) {
      return undefined
    }
    const line = lines.indexOf(coordinates[0].line)
    const caretPosition = lines[line].indexOf(this.caretIndicator)
    const character = caretPosition >= 0 ? caretPosition : lines[line].length
    return { line, character }
  }

  /**
   * @param {string} content
   * @param {{line: number, character: number}} transformedPosition
   * @return {{line: number, character: number}|undefined}
   */
  static convertTransformedToOriginal (content, transformedPosition) {
    const lines = content.split('\n')
    if (transformedPosition.line >= lines.length) {
      return undefined
    }
    const line = lines[transformedPosition.line]
    const position = getPositionFromLine(line)
    return position
  }

  /**
   * @type {string}
   */
  static get caretIndicator () {
    return '\x1B'
  }
}

/**
 * @param {string} line
 * @return {{line: number, character: number}}
 */
function getPositionFromLine (line) {
  const pair = line.substr(0, line.indexOf(' ')).split(',')
  return { line: +pair[0], character: +pair[1] }
}
