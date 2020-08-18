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

  //First, produce a flat list of all meaningful nodes from the hierarchy
  while (nodes.length > 0) {
    const node = nodes.shift()
    if (node === undefined) {
      continue
    }
    if (visitedNodes.includes(node)) {
      continue
    }
    visitedNodes.push(node)
    const childNodes = visitChildNodes(node)
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
function visitChildNodes (node) {
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
    case 'ExpressionStatement':
      return [node.expression]
    case 'AssignmentExpression':
      return [node.left, node.right]
    case 'ObjectExpression':
      return node.properties.filter(p => {
        // @ts-ignore
        return p.type == 'Property'
      }).map(p => {
        // @ts-ignore
        return p.value
      })
    case 'ClassExpression':
    case 'ClassDeclaration':
      return node.body.type === 'ClassBody' ? node.body.body : []
    default:
      return []
  }
}

/**
 * Gets a string for a given node
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
      let exportName = findExportNameFromDefaultExport(node, allNodes, className) ||
                       findExportNameFromNamedExport(node, allNodes, className) ||
                       findExportNameFromModuleExports(node, allNodes, className)
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
 * Gets output for a given class, so it could be repeated for its members
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
 * Gets a pair of integer values such as 0,2 that represent the zero-based position (line,character) of the original node starting point
 * @param {import("@babel/types").Node} node
 * @return {string}
 */
function getCoordinatesForNode (node) {
  return node.loc && node.loc.start ? `${node.loc.start.line - 1},${node.loc.start.column}` : ''
}

/**
 * Get names of decorators separated by comma, such as '@Decorator1,@Decorator2'
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
 * Gets the parent of the given node, if any
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
 * Removes coordinates from an output string, such as 0,2
 * @param {string} content
 * @return {string}
 */
function stripCoordinates (content) {
  const spacePosition = content.indexOf(' ')
  return content.substr(spacePosition + 1)
}

/**
 * finds export name from ES6-style default export
 * @param {import("@babel/types").Node} node
 * @param {Array<import("@babel/types").Node>} allNodes
 * @param {string} className
 * @return {string}
 */
function findExportNameFromDefaultExport(node, allNodes, className) {
  const defaultExport = allNodes.find(n => n.type === 'ExportDefaultDeclaration' && (
    (n.declaration.type === 'Identifier' && n.declaration.name === className) ||
    (n.declaration === node)
  ))
  if (defaultExport) {
    return 'default'
  }
  return ''
}

/**
 * finds export name from ES6-style named export
 * @param {import("@babel/types").Node} node
 * @param {Array<import("@babel/types").Node>} allNodes
 * @param {string} className
 * @return {string}
 */
function findExportNameFromNamedExport(node, allNodes, className) {
  const namedExport = allNodes.find(n => n.type === 'ExportNamedDeclaration' &&
      n.declaration && n.declaration.type === 'VariableDeclaration' && n.declaration.declarations.length !== 0 && n.declaration.declarations[0].init &&
      ((n.declaration.declarations[0].init.type === 'ClassExpression' && ((n.declaration.declarations[0].init.id && n.declaration.declarations[0].init.id.name === className) || n.declaration.declarations[0].init === node)) ||
      (n.declaration.declarations[0].init.type === 'Identifier' && n.declaration.declarations[0].init.name === className)) &&
      (n.declaration.declarations[0].id.type === 'Identifier'))
  if (namedExport) {
    // @ts-ignore
    return namedExport.declaration.declarations[0].id.name
  }
  return ''
}

/**
 * finds export name from node-style module exports
 * @param {import("@babel/types").Node} node
 * @param {Array<import("@babel/types").Node>} allNodes
 * @param {string} className
 * @return {string}
 */
function findExportNameFromModuleExports(node, allNodes, className) {
  const moduleExport = /** @type {import("@babel/types").AssignmentExpression|null} */ (allNodes.find(n => n.type === 'AssignmentExpression' && n.left.type === 'MemberExpression' && n.left.object.type === 'Identifier' && n.left.object.name === 'module' && n.left.property.type === 'Identifier' && n.left.property.name === 'exports'))
  if (!moduleExport) {
    return ''
  }
  if (moduleExport.right === node) {
    return 'default'
  }
  if (moduleExport.right.type === 'ObjectExpression') {
    const namedExport = moduleExport.right.properties.find(p => {
      const pr = /** @type {import("@babel/types").ObjectProperty} */ (p);
      return pr.value === node || (pr.value.type === 'Identifier' && pr.value.name == className)
    })
    if (namedExport) {
      const objectProperty = /** @type {import("@babel/types").ObjectProperty} */ (namedExport);
      if (objectProperty.key.type === 'Identifier') {
        return objectProperty.key.name
      }
    }
  }
  return ''
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
