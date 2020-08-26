const { Parser } = require('htmlparser2')
module.exports = class FlattenHtmlFormatter {
  /**
   * @type {string}
   */
  #content

  /**
   * @type {Array<string>}
   */
  #output

  /**
   * @type {Array<string>}
   */
  #stack

  /**
   * @type {number}
   */
  #lastIndex

  /**
   * @type {number}
   */
  #line

  /**
   * @type {number}
   */
  #lastLineIndex

  /**
   * @param {string} content
   */
  constructor (content) {
    this.#content = content
    this.#output = []
    this.#stack = []
    this.#lastIndex = 0
    this.#lastLineIndex = -1
    this.#line = 0
  }

  /**
   * @return {string}
   */
  getOutput () {
    return this.#output.join('\n')
  }

  /**
   * @param {number} startIndex
   * @param {number} endIndex
   * @param {boolean} addToStack
   */
  push (startIndex, endIndex, addToStack) {
    for (let i = this.#lastIndex; i < startIndex; i++) {
      if (this.#content.charAt(i) === '\n') {
        this.#line++
        this.#lastLineIndex = i
      }
    }
    this.#lastIndex = startIndex
    const item = this.#content.substr(startIndex, endIndex - startIndex + 1).replace(/[\n|\r]/g, '')
    const position = `${this.#line},${startIndex - this.#lastLineIndex - 1}`
    this.#output.push(`${position} ${this.#stack.join('')}${item}`)
    if (addToStack) {
      this.#stack.push(item)
    }
  }

  pop () {
    this.#stack.pop()
  }

  /**
   * @param {string} content
   * @return {string}
   */
  static parseAndFormat (content) {
    const formatter = new FlattenHtmlFormatter(content)
    /**
     * @type {any}
     */
    let parser = null
    parser = new Parser(
      {
        onopentag () {
          formatter.push(parser.startIndex, parser.endIndex, true)
        },
        onclosetag () {
          formatter.pop()
        },
        ontext (text) {
          if ((text || '').trim()) {
            formatter.push(parser.startIndex, parser.endIndex, false)
          }
        }
      },
      { decodeEntities: true }
    )
    parser.write(content)
    parser.end()
    return formatter.getOutput()
  }
}
