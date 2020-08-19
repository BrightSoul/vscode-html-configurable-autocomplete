const vscode = require('vscode')
const channel = vscode.window.createOutputChannel('HTML Configurable Autocomplete')
/**
 * @type {boolean}
 */
let isDebug = false
module.exports = class Logger {
  /**
   * Enables or disables debug mode
   * @param {boolean} value
   */
  static setDebug (value) {
    isDebug = value
    if (isDebug) {
      Logger.debug('Verbose logging enabled')
    }
  }

  /**
   * @param {string} text
   */
  static debug (text) {
    if (isDebug) {
      channel.appendLine(`DEBUG: ${text}`)
    }
  }

  /**
   * @param {string} text
   */
  static info (text) {
    channel.appendLine(`INFO: ${text}`)
  }

  /**
   * @param {string} text
   */
  static warn (text) {
    channel.appendLine(`WARN: ${text}`)
  }

  /**
   * @param {string} text
   */
  static error (text) {
    channel.appendLine(`ERROR: ${text}`)
  }
}
