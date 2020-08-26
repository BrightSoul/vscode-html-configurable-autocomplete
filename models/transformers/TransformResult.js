const TransformedPositionConverter = require('../services/TransformedPositionConverter')
const Logger = require('../services/Logger')
const vscode = require('vscode')

module.exports = class TransformResult {
  /**
   * @type {string}
   */
  content

  /**
   * @type {(position: import('vscode').Position) => import('vscode').Position}
   */
  convertTransformedPositionToOriginalPosition

  /**
   * @type {(position: import('vscode').Position) => import('vscode').Position}
   */
  convertOriginalPositionToTransformedPosition

  /**
   *
   * @param {string} content
   * @param {((content: string, position: import('vscode').Position) => import('vscode').Position)|undefined} [transformedToOriginalPositionConverter]
   * @param {((content: string, position: import('vscode').Position) => import('vscode').Position)|undefined} [originalToTransformedPositionConverter]
   */
  constructor (content, transformedToOriginalPositionConverter, originalToTransformedPositionConverter) {
    this.content = content
    this.convertTransformedPositionToOriginalPosition = (transformedToOriginalPositionConverter || TransformResult.defaultConverter).bind(this, content)
    this.convertOriginalPositionToTransformedPosition = (originalToTransformedPositionConverter || TransformResult.defaultConverter).bind(this, content)
  }

  /**
   * @param {string} content
   * @param {import('vscode').Position} position
   */
  static defaultConverter (content, position) {
    return position
  }

  /**
   * @param {string} content
   * @param {vscode.Position} originalPosition
   * @returns {vscode.Position}
   */
  static originalToTransformedPositionConverter (content, originalPosition) {
    const transformedPosition = TransformedPositionConverter.convertOriginalToTransformed(content, originalPosition)
    if (!transformedPosition) {
      Logger.error("Couldn't convert original position")
      return originalPosition
    }
    return new vscode.Position(transformedPosition.line, transformedPosition.character)
  }

  /**
   * @param {string} content
   * @param {vscode.Position} transformedPosition
   * @returns {vscode.Position}
   */
  static transformedToOriginalPositionConverter (content, transformedPosition) {
    const originalPosition = TransformedPositionConverter.convertOriginalToTransformed(content, transformedPosition)
    if (!originalPosition) {
      Logger.error("Couldn't convert transformed position")
      return transformedPosition
    }
    return new vscode.Position(originalPosition.line, originalPosition.character)
  }
}
