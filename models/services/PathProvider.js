const vscode = require('vscode');
const path = require('path');

module.exports = class PathProvider {

	/**
	 * @param {string|undefined} text
	 * @param {vscode.TextDocument} document
	 * @param {string|undefined} [prefix]
	 */
	static replacePathVariables(text, document, prefix) {
		if (!text) {
			return undefined;
		}
		const workspaceDir = vscode.workspace.getWorkspaceFolder(document.uri);
		if (!workspaceDir) {
			return text;
		}
		const { dirName, dirPath, fileName, filePath, fileNameWithoutExtension } = PathProvider.getPaths(document.uri.fsPath, workspaceDir.uri.fsPath);

		prefix = prefix || '';
		return text
				.replace('${'+prefix+'dirName}', dirName)
				.replace('${'+prefix+'dirPath}', dirPath)
				.replace('${'+prefix+'filePath}', filePath)
				.replace('${'+prefix+'fileName}', fileName)
				.replace('${'+prefix+'fileNameWithoutExtension}', fileNameWithoutExtension);
	}

    /**
     * @param {string} filePath
     * @param {string} rootPath
     */
    static getPaths(filePath, rootPath) {
		const dirName = path.basename(path.relative(rootPath, path.dirname(filePath)));
		const fileName = path.basename(filePath);
		let dirPath = (path.relative(rootPath, filePath.substr(0, filePath.length - fileName.length)).replace(/\\/g, '/') + '/');
		if (dirPath.substr(0, 1) == '/') {
			dirPath = dirPath.substr(1);
		}
		filePath = path.relative(rootPath, filePath).replace(/\\/g, '/');
        const fileNameWithoutExtension = fileName.substr(0, fileName.length - path.extname(fileName).length);
        
        return { dirName, dirPath, fileName, filePath, fileNameWithoutExtension };
    }
};