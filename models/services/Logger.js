const vscode = require('vscode')
const channel = vscode.window.createOutputChannel('HTML Configurable Autocomplete')
module.exports = class Logger {
  /**
     * @param {string} text
     */
  static error (text) {
    channel.appendLine(`ERROR: ${text}`)
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
}
