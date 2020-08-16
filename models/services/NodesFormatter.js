/**
 * Visits nodes and produces flat output
 * @param {Array<import("@babel/types").Node>} nodes
 * @param {Array<string>} output
 */
function visitNodes (nodes, output) {
  /**
   * @type {Array<import("@babel/types").Node>}
   */
  const visitedNodes = []

  while (nodes.length > 0) {
    const node = nodes.shift()
    if (node === undefined) {
      continue
    }
    if (visitedNodes.includes(node)) {
      continue
    }
    visitedNodes.push(node)
    const childNodes = extractChildNodesFromNode(node)
    for (const childNode of childNodes) {
      Object.defineProperty(childNode, '_parent', { writable: false, value: node })
      nodes.push(childNode)
    }
  }
  /**
   * @type {WeakMap<import("@babel/types").Node, Array<string>>} outputs
   */
  const outputs = new WeakMap()

  for (const node of visitedNodes) {
    const nodeOutput = generateOutputForNode(node, visitedNodes, outputs)
    outputs.set(node, nodeOutput)
    output.push(...nodeOutput)
  }
  return output
}

/**
 * @param {import("@babel/types").Node} node
 * @return {Array<import("@babel/types").Node>}
 */
function extractChildNodesFromNode (node) {
  switch (node.type) {
    case 'Program':
      return node.body
    case 'ExportDefaultDeclaration':
      return [node.declaration]
    case 'ExportNamedDeclaration':
      return node.declaration ? [node.declaration] : []
    case 'VariableDeclaration':
      return node.declarations
    case 'VariableDeclarator':
      return node.init ? [node.init] : []
    case 'ClassExpression':
    case 'ClassDeclaration':
      return node.body.type === 'ClassBody' ? node.body.body : []
    default:
      return []
  }
}

/**
 * @param {import("@babel/types").Node} node
 * @param {Array<import("@babel/types").Node>} allNodes
 * @param {WeakMap<import("@babel/types").Node, Array<string>>} outputs
 * @return {Array<string>}
 */
function generateOutputForNode (node, allNodes, outputs) {
  const coordinates = getCoordinatesForNode(node)
  const decoratorNames = getDecoratorNames(node)

  switch (node.type) {
    case 'ClassDeclaration':
    case 'ClassExpression': {
      const classDeclaration = node
      const className = classDeclaration.id ? classDeclaration.id.name : ''
      const superClassName = classDeclaration.superClass != null && classDeclaration.superClass.type === 'Identifier' ? (':' + /** @type {import("@babel/types").Identifier} */ (classDeclaration.superClass).name) : ''
      let exportName = ''
      const defaultExport = allNodes.find(n => n.type === 'ExportDefaultDeclaration' && (
        (n.declaration.type === 'Identifier' && n.declaration.name === className) ||
        (n.declaration.type === 'ClassDeclaration' && ((n.declaration.id && n.declaration.id.name === className) || (n.declaration === node)))
      ))
      if (defaultExport) {
        exportName = 'default'
      } else {
        allNodes.find(n => n.type === 'ExportNamedDeclaration' &&
          n.declaration && n.declaration.type === 'VariableDeclaration' && n.declaration.declarations.length !== 0 && n.declaration.declarations[0].init &&
          ((n.declaration.declarations[0].init.type === 'ClassExpression' && ((n.declaration.declarations[0].init.id && n.declaration.declarations[0].init.id.name === className) || n.declaration.declarations[0].init === node)) ||
          (n.declaration.declarations[0].init.type === 'Identifier' && n.declaration.declarations[0].init.name === className)) &&
          (n.declaration.declarations[0].id.type === 'Identifier' && (exportName = n.declaration.declarations[0].id.name)))
      }
      return [`${coordinates} ${exportName} class ${className}${superClassName} ${decoratorNames}`]
    }
    case 'ClassProperty': {
      const publicPropertyType = node.static ? 'static' : 'instance'
      const publicPropertyName = node.key.type === 'Identifier' ? node.key.name : ''
      return [`${coordinates} ${getParentClassOutput(node, outputs)} ${publicPropertyType} public property ${publicPropertyName} ${decoratorNames}`]
    }
    case 'ClassPrivateProperty': {
      const privatePropertyName = node.key.id.name
      return [`${coordinates} ${getParentClassOutput(node, outputs)} instance private property ${privatePropertyName} ${decoratorNames}`]
    }
    // @ts-ignore
    case 'MethodDefinition':
    case 'ClassMethod': {
      const methodAccessor = node.static ? 'static' : 'instance'
      const methodKind = node.kind
      const methodName = node.key.type === 'Identifier' ? node.key.name : ''
      return [`${coordinates} ${getParentClassOutput(node, outputs)} ${methodAccessor} public ${methodKind} ${methodName} ${decoratorNames}`]
    }
    case 'ClassPrivateMethod': {
      const privateMethodAccessor = node.static ? 'static' : 'instance'
      const privateMethodKind = node.kind
      const privateMethodName = node.key.id.name
      return [`${coordinates} ${getParentClassOutput(node, outputs)} ${privateMethodAccessor} private ${privateMethodKind} ${privateMethodName} ${decoratorNames}`]
    }
    default:
      return []
  }
}

/**
 * @param {import("@babel/types").Node} node
 * @param {WeakMap<import("@babel/types").Node, Array<string>>} outputs
 * @return {string}
 */
function getParentClassOutput (node, outputs) {
  const parentNode = getParentNode(node)
  let parentClassOutput = ''
  if (parentNode) {
    const parentOutput = outputs.get(parentNode)
    if (parentOutput && parentOutput.length > 0) {
      parentClassOutput = stripCoordinates(parentOutput[0])
    }
  }
  return parentClassOutput
}

/**
 *
 * @param {import("@babel/types").Node} node
 * @return {string}
 */
function getCoordinatesForNode (node) {
  return node.loc && node.loc.start ? `${node.loc.start.line - 1},${node.loc.start.column}` : ''
}

/**
 *
 * @param {import("@babel/types").Node} node
 * @return {string}
 */
function getDecoratorNames (node) {
  if (!('decorators' in node)) {
    return ''
  }
  return (node.decorators || []).filter(d => d.expression.type === 'Identifier').map(d => '@' + /** @type {import("@babel/types").Identifier} */ (d.expression).name).join(',')
}

/**
 *
 * @param {import("@babel/types").Node} node
 * @return {import("@babel/types").Node|undefined}
 */
function getParentNode (node) {
  if ('_parent' in node) {
    return /** @type {any} */ (node)._parent
  }
  return undefined
}

/**
 *
 * @param {string} content
 * @return {string}
 */
function stripCoordinates (content) {
  const spacePosition = content.indexOf(' ')
  return content.substr(spacePosition + 1)
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
    const output = []
    if (!Array.isArray(nodes)) {
      nodes = [nodes]
    }
    visitNodes(nodes.slice(0), output)
    return output.join('\n')
  }
}
