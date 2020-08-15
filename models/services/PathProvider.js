const vscode = require('vscode')
const path = require('path')

module.exports = class PathProvider {
  /**
   * @param {string|undefined} text
   * @param {import('./ProviderRegistry')} providerRegistry
   * @param {vscode.TextDocument} document
   * @param {vscode.Position} position
   * @param {vscode.CancellationToken} token
   * @returns {Promise<string|undefined>}
   */
  static async replaceAllPathVariables (text, providerRegistry, document, position, token) {
    text = this.replaceDocumentPathVariables(text, document)
    text = await this.replaceDefinitionPathVariables(text, providerRegistry, document, position, token)
    return text
  }

  /**
   * @param {string|undefined} text
   * @param {vscode.TextDocument} document
   * @returns {string|undefined}
   */
  static replaceDocumentPathVariables (text, document) {
    if (!text) {
      return text
    }
    const workspaceDir = vscode.workspace.getWorkspaceFolder(document.uri)
    if (!workspaceDir) {
      return text
    }
    const { dirName, dirPath, fileName, filePath, fileNameWithoutExtension } = PathProvider.getPaths(document.uri.fsPath, workspaceDir.uri.fsPath)

    return text
      .replace('$' + '{dirName}', dirName)
      .replace('$' + '{dirPath}', dirPath)
      .replace('$' + '{filePath}', filePath)
      .replace('$' + '{fileName}', fileName)
      .replace('$' + '{fileNameWithoutExtension}', fileNameWithoutExtension)
  }

  /**
   * @param {string|undefined} text
   * @param {import('./ProviderRegistry')} providerRegistry
   * @param {vscode.TextDocument} document
   * @param {vscode.Position} position
   * @param {vscode.CancellationToken} token
   * @returns {Promise<string|undefined>}
   */
  static async replaceDefinitionPathVariables (text, providerRegistry, document, position, token) {
    if (!text || !text.includes('${definition')) {
      return text
    }

    if (providerRegistry.definitionProviders.length === 0) {
      return text
    }

    for (const provider of providerRegistry.definitionProviders) {
      const location = await provider.provideDefinition(document, position, token)
      if (location) {
        const workspaceDir = vscode.workspace.getWorkspaceFolder(location.uri)
        if (!workspaceDir) {
          continue
        }
        const { dirName, dirPath, fileName, filePath, fileNameWithoutExtension } = PathProvider.getPaths(location.uri.fsPath, workspaceDir.uri.fsPath)
        return text
          .replace('$' + '{definitionDirName}', dirName)
          .replace('$' + '{definitionDirPath}', dirPath)
          .replace('$' + '{definitionFilePath}', filePath)
          .replace('$' + '{definitionFileName}', fileName)
          .replace('$' + '{definitionFileNameWithoutExtension}', fileNameWithoutExtension)
      }
    }

    return text
  }

  /**
     * @param {string} filePath
     * @param {string} rootPath
     */
  static getPaths (filePath, rootPath) {
    const dirName = path.basename(path.relative(rootPath, path.dirname(filePath)))
    const fileName = path.basename(filePath)
    let dirPath = (path.relative(rootPath, filePath.substr(0, filePath.length - fileName.length)).replace(/\\/g, '/') + '/')
    if (dirPath.substr(0, 1) === '/') {
      dirPath = dirPath.substr(1)
    }
    filePath = path.relative(rootPath, filePath).replace(/\\/g, '/')
    const fileNameWithoutExtension = fileName.substr(0, fileName.length - path.extname(fileName).length)

    return { dirName, dirPath, fileName, filePath, fileNameWithoutExtension }
  }
}
