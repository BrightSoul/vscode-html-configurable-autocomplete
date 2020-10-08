const clarinet = require('clarinet');

module.exports = class FlattenJsonFormatter {
  /**
   * @type {string}
   */
  #content

  /**
   * @type {Array<string>}
   */
  #output

  /**
   * @type {Array<{item: string, index: number|undefined}>}
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
   * @type {number}
   */
  #objectsClosed = 0;

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
   * @param {string|undefined} key
   * @param {boolean} addToStack
   */
  push (startIndex, key, addToStack) {

    // Compensate for this bug: https://github.com/dscape/clarinet/issues/68
    startIndex -= this.#objectsClosed;

    if (this.#stack.length > 0) {
      const lastItem = this.#stack[this.#stack.length-1];
      if (lastItem !== undefined && lastItem.index !== undefined) {
        lastItem.index++;
      }
      if (lastItem.index === undefined && key === undefined) {
        return;
      }
    }

    for (let i = this.#lastIndex; i < startIndex; i++) {
      if (this.#content.charAt(i) === '\n') {
        this.#line++
        this.#lastLineIndex = i
      }
    }
    this.#lastIndex = startIndex
    
    const item = key ? { item: key, index: undefined } : undefined
    const position = `${this.#line},${startIndex - this.#lastLineIndex - 1}`
    const currentStack = item ? this.#stack.concat(item) : this.#stack
    const joinedStack = currentStack.map(c => {
      if (c.index === undefined) {
        return c.item
      }
      return `${c.item}[${c.index}]`
    }).join('.');
    this.#output.push(`${position} ${joinedStack}`)
    if (addToStack && item) {
      this.#stack.push(item)
    }
  }

  pop () {
    this.#objectsClosed++
    this.#stack.pop()
  }

  pushArray () {
    if (this.#stack.length === 0) {
      this.push(0, '', true)
    }
    const lastItem = this.#stack[this.#stack.length-1]
    lastItem.index = lastItem.index === undefined ? -1 : lastItem.index + 1
  }

  popArray () {
    
  }

  /**
   * @param {string} content
   * @return {string}
   */
  static parseAndFormat (content) {
    const formatter = new FlattenJsonFormatter(content)
    /**
     * @type {clarinet.CParser}
     */
    let parser;
    parser = clarinet.parser()
    
    parser.onopenobject = function (key) {
      formatter.push(parser.position - key.length - 3, key, true)
    }
    parser.onkey = function (key) {
      formatter.push(parser.position, key, false)
    }
    parser.oncloseobject = function () {
      formatter.pop()
    }
    parser.onopenarray = function () {
      formatter.pushArray();
    }
    parser.onclosearray = function () {
      formatter.popArray();
    }
    parser.onvalue = function (value) {
      formatter.push(parser.position - JSON.stringify(value).length - 1, undefined, false)
    }
    
    parser.write(content)
    parser.close()
    return formatter.getOutput()
  }
}
