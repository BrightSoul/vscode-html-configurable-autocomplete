module.exports = class HtmlHierarchyFormatter {
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
   */
  push (startIndex, endIndex) {
    for (let i = this.#lastIndex; i < startIndex; i++) {
      if (this.#content.charAt(i) === '\n') {
        this.#line++
        this.#lastLineIndex = i
      }
    }
    this.#lastIndex = startIndex
    const item = this.#content.substr(startIndex, endIndex - startIndex + 1)
    this.#stack.push(item)
    const position = `${this.#line},${startIndex - this.#lastLineIndex - 1}`
    this.#output.push(`${position} ${this.#stack.join('')}`)
  }

  pop () {
    this.#stack.pop()
  }
}
