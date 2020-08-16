const it = require('@jest/globals').it
const expect = require('@jest/globals').expect
const formatter = require('../models/services/NodesFormatter')
const parse = require('babel-eslint/lib/parse')
const config = { ecmaVersion: 2020, sourceType: 'module' }

it('should output default export class with decorators and base class', () => {
  // Arrange
  const content = '@Fizz @Buzz class Foo extends Bar {}\nexport default Foo'
  const node = parse(content, config)
  const expectedOutput = '0,0 class Foo:Bar @Fizz,@Buzz default'

  // Act
  const actualOutput = formatter.formatNodes(node)

  // Assert
  expect(actualOutput).toBe(expectedOutput)
})

it('should output default export class', () => {
  // Arrange
  const content = 'export default class Foo extends Bar {}'
  const node = parse(content, config)
  const expectedOutput = '0,15 class Foo:Bar  default'

  // Act
  const actualOutput = formatter.formatNodes(node)

  // Assert
  expect(actualOutput).toBe(expectedOutput)
})

it('should output const export class', () => {
  // Arrange
  const content = 'export const fizz = class Foo extends Bar {}'
  const node = parse(content, config)
  const expectedOutput = '0,20 class Foo:Bar  fizz'

  // Act
  const actualOutput = formatter.formatNodes(node)

  // Assert
  expect(actualOutput).toBe(expectedOutput)
})

it('should output const export anynomous class', () => {
  // Arrange
  const content = 'export const fizz = class {}'
  const node = parse(content, config)
  const expectedOutput = '0,20 class   fizz'

  // Act
  const actualOutput = formatter.formatNodes(node)

  // Assert
  expect(actualOutput).toBe(expectedOutput)
})

it('should output not exported class', () => {
  // Arrange
  const content = '@Fizz class Foo extends Bar {}'
  const node = parse(content, config)
  const expectedOutput = '0,0 class Foo:Bar @Fizz '

  // Act
  const actualOutput = formatter.formatNodes(node)

  // Assert
  expect(actualOutput).toBe(expectedOutput)
})

it('should output class properties', () => {
  // Arrange
  const content = 'export default class Foo {\nbar\nbaz\n}'
  const node = parse(content, config)
  const expectedOutput = '0,15 class Foo  default\n1,0 class Foo  default instance public property bar \n2,0 class Foo  default instance public property baz '

  // Act
  const actualOutput = formatter.formatNodes(node)

  // Assert
  expect(actualOutput).toBe(expectedOutput)
})

it('should output class and constructor', () => {
  // Arrange
  const content = 'export default class Foo {\nconstructor(value) { void(value) }\n}'
  const node = parse(content, config)
  const expectedOutput = '0,15 class Foo  default\n1,0 class Foo  default instance public constructor constructor '

  // Act
  const actualOutput = formatter.formatNodes(node)

  // Assert
  expect(actualOutput).toBe(expectedOutput)
})

it('should output const export anynomous class and property', () => {
  // Arrange
  const content = 'export const fizz = class {\nbar\n}'
  const node = parse(content, config)
  const expectedOutput = '0,20 class   fizz\n1,0 class   fizz instance public property bar '

  // Act
  const actualOutput = formatter.formatNodes(node)

  // Assert
  expect(actualOutput).toBe(expectedOutput)
})

it('should output class and static property', () => {
  // Arrange
  const content = 'export default class Foo {\nstatic bar\n}'
  const node = parse(content, config)
  const expectedOutput = '0,15 class Foo  default\n1,0 class Foo  default static public property bar '

  // Act
  const actualOutput = formatter.formatNodes(node)

  // Assert
  expect(actualOutput).toBe(expectedOutput)
})

it('should output class and getters', () => {
  // Arrange
  const content = 'export default class Foo {\nget bar () { return 1 }\nget baz () { return 2 }\n}'
  const node = parse(content, config)
  const expectedOutput = '0,15 class Foo  default\n1,0 class Foo  default instance public get bar \n2,0 class Foo  default instance public get baz '

  // Act
  const actualOutput = formatter.formatNodes(node)

  // Assert
  expect(actualOutput).toBe(expectedOutput)
})

it('should output class and setters', () => {
  // Arrange
  const content = 'export default class Foo {\nset bar (value) { void(value) }\nset baz (value) { void(value) }\n}'
  const node = parse(content, config)
  const expectedOutput = '0,15 class Foo  default\n1,0 class Foo  default instance public set bar \n2,0 class Foo  default instance public set baz '

  // Act
  const actualOutput = formatter.formatNodes(node)

  // Assert
  expect(actualOutput).toBe(expectedOutput)
})

it('should output class and static getters', () => {
  // Arrange
  const content = 'export default class Foo {\nstatic get bar () { return 1 }\nstatic get baz () { return 2 }\n}'
  const node = parse(content, config)
  const expectedOutput = '0,15 class Foo  default\n1,0 class Foo  default static public get bar \n2,0 class Foo  default static public get baz '

  // Act
  const actualOutput = formatter.formatNodes(node)

  // Assert
  expect(actualOutput).toBe(expectedOutput)
})

it('should output class and static setters', () => {
  // Arrange
  const content = 'export default class Foo {\nstatic set bar (value) { void(value) }\nstatic set baz (value) { void(value) }\n}'
  const node = parse(content, config)
  const expectedOutput = '0,15 class Foo  default\n1,0 class Foo  default static public set bar \n2,0 class Foo  default static public set baz '

  // Act
  const actualOutput = formatter.formatNodes(node)

  // Assert
  expect(actualOutput).toBe(expectedOutput)
})

it('should output class and static methods', () => {
  // Arrange
  const content = 'export default class Foo {\nstatic bar (value) { void(value) }\nstatic baz (value) { void(value) }\n}'
  const node = parse(content, config)
  const expectedOutput = '0,15 class Foo  default\n1,0 class Foo  default static public method bar \n2,0 class Foo  default static public method baz '

  // Act
  const actualOutput = formatter.formatNodes(node)

  // Assert
  expect(actualOutput).toBe(expectedOutput)
})

it('should output class and private property', () => {
  // Arrange
  const content = 'export default class Foo {\n#bar\n}'
  const node = parse(content, config)
  const expectedOutput = '0,15 class Foo  default\n1,0 class Foo  default instance private property bar '

  // Act
  const actualOutput = formatter.formatNodes(node)

  // Assert
  expect(actualOutput).toBe(expectedOutput)
})

it('should output class and method with decorators', () => {
  // Arrange
  const content = 'export default class Foo {\n@fizz @buzz bar() {}\n}'
  const node = parse(content, config)
  const expectedOutput = '0,15 class Foo  default\n1,0 class Foo  default instance public method bar @fizz,@buzz'

  // Act
  const actualOutput = formatter.formatNodes(node)

  // Assert
  expect(actualOutput).toBe(expectedOutput)
})