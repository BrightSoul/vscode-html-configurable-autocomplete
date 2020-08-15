module.exports = class TransformResult {
  /**
   * @type {string}
   */
  content

  /**
   * @type {(position: import('vscode').Position) => import('vscode').Position}
   */
  positionResolver

  /**
   *
   * @param {string} content
   * @param {((content: string, position: import('vscode').Position) => import('vscode').Position)|undefined} [positionResolver]
   */
  constructor (content, positionResolver) {
    this.content = content
    this.positionResolver = (positionResolver || TransformResult.defaultResolver).bind(this, content)
  }

  /**
   * @param {string} content
   * @param {import('vscode').Position} position
   */
  static defaultResolver (content, position) {
    return position
  }
}
