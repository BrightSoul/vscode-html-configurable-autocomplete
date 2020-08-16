/**
 * Visits nodes and produces flat output
 * @param {Array<import("@babel/types").Node>} nodes
 * @param {Array<string>} output
 */
function visitNodes(nodes, output) {
  /**
   * @type {Array<import("@babel/types").Node>}
   */
  const visitedNodes = [];

  while(nodes.length > 0) {
    const node = nodes.shift()
    if (node === undefined) {
      continue;
    }
    if (visitedNodes.includes(node)) {
      continue;
    }
    visitedNodes.push(node);
    const childNodes = extractChildNodesFromNode(node)
    nodes.push(...childNodes)
  }

  for(const node of visitedNodes) {
    const nodeOutput = generateOutputForNode(node, visitedNodes)
    output.push(...nodeOutput)
  }
  return output
}

/**
 * @param {import("@babel/types").Node} node
 * @return {Array<import("@babel/types").Node>}
 */
function extractChildNodesFromNode(node) {
  switch(node.type) {
    case 'Program':
      return node.body;
    case 'ExportDefaultDeclaration':
      return [node.declaration]
    case 'ExportNamedDeclaration':
      return node.declaration ? [node.declaration] : []
    case 'VariableDeclaration':
      return node.declarations;
    case 'VariableDeclarator':
      return node.init ? [node.init] : [];
    default:
      return []
  }
}

/**
 * @param {import("@babel/types").Node} node
 * @param {Array<import("@babel/types").Node>} allNodes
 * @return {Array<string>}
 */
function generateOutputForNode(node, allNodes) {
  switch(node.type) {
    case 'ClassDeclaration':
    case 'ClassExpression':
      const classDeclaration = node
      const className = classDeclaration.id ? classDeclaration.id.name : '';
      const superClassName = classDeclaration.superClass != null && classDeclaration.superClass.type === 'Identifier' ? (':' + /** @type {import("@babel/types").Identifier} */ (classDeclaration.superClass).name) : ''
      const decoratorNames = (classDeclaration.decorators||[]).filter(d => d.expression.type === 'Identifier').map(d => '@' + /** @type {import("@babel/types").Identifier} */ (d.expression).name).join(',')
      const coordinates = getCoordinatesForNode(node)
      let exportName = '';
      const defaultExport = allNodes.find(n => n.type === 'ExportDefaultDeclaration' && (
          (n.declaration.type === 'Identifier' && n.declaration.name === className) ||
          (n.declaration.type === 'ClassDeclaration' && n.declaration.id.name === className)
      ));
      if (defaultExport) {
        exportName = 'default';
      } else {
        allNodes.find(n => n.type == 'ExportNamedDeclaration' && 
          n.declaration && n.declaration.type == 'VariableDeclaration' && n.declaration.declarations.length !== 0 && n.declaration.declarations[0].init && n.declaration.declarations[0].init.type === 'ClassExpression' && ((n.declaration.declarations[0].init.id && n.declaration.declarations[0].init.id.name == className) || n.declaration.declarations[0].init === node) && n.declaration.declarations[0].id.type == 'Identifier'
          && (exportName = n.declaration.declarations[0].id.name))
      }
      return [`${coordinates} class ${className}${superClassName} ${decoratorNames} ${exportName}`]
    default:
      return []
  }
}

/**
 * 
 * @param {import("@babel/types").Node} node 
 * @return {string}
 */
function getCoordinatesForNode(node) {
  return node.loc && node.loc.start ? `${node.loc.start.line-1},${node.loc.start.column}` : ''
}

module.exports = class NodesFormatter {
  /**
   * @param {Array<import("@babel/types").Node>|import("@babel/types").Node} nodes
   * @return {string}
   */
  static formatNodes (nodes) {
    /**
     * @type {Array<string>}
     */
    const output = [];
    if (!Array.isArray(nodes)) {
      nodes = [nodes]
    }
    visitNodes(nodes.slice(0), output)
    return output.join('\n')
  }
}
