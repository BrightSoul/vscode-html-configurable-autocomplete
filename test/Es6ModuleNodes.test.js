const formatter = require('../models/services/NodesFormatter')
const parse = require('babel-eslint/lib/parse')
const config = { ecmaVersion: 2020, sourceType: 'module' };

it('should output default export class with decorators and base class', () => {
  //Arrange
  const content = "@Fizz @Buzz class Foo extends Bar {}\nexport default Foo";
  const node = parse(content, config);
  const expectedOutput = '0,0 class Foo:Bar @Fizz,@Buzz default';
  
  //Act
  const actualOutput = formatter.formatNodes(node)

  //Assert
  expect(actualOutput).toBe(expectedOutput)

});

it('should output default export class', () => {
  //Arrange
  const content = "export default class Foo extends Bar {}";
  const node = parse(content, config);
  const expectedOutput = '0,15 class Foo:Bar  default';
  
  //Act
  const actualOutput = formatter.formatNodes(node)

  //Assert
  expect(actualOutput).toBe(expectedOutput)

});

it('should output const export class', () => {
  //Arrange
  const content = "export const fizz = class Foo extends Bar {}";
  const node = parse(content, config);
  const expectedOutput = '0,20 class Foo:Bar  fizz';
  
  //Act
  const actualOutput = formatter.formatNodes(node)

  //Assert
  expect(actualOutput).toBe(expectedOutput)

});

it('should output const export anynomous class', () => {
  //Arrange
  const content = "export const fizz = class {}";
  const node = parse(content, config);
  const expectedOutput = '0,20 class   fizz';
  
  //Act
  const actualOutput = formatter.formatNodes(node)

  //Assert
  expect(actualOutput).toBe(expectedOutput)

});

it('should output not exported class', () => {
  //Arrange
  const content = "@Fizz class Foo extends Bar {}";
  const node = parse(content, config);
  const expectedOutput = '0,0 class Foo:Bar @Fizz ';
  
  //Act
  const actualOutput = formatter.formatNodes(node)

  //Assert
  expect(actualOutput).toBe(expectedOutput)

});