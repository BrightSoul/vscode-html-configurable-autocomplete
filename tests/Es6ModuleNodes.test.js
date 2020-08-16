const formatter = require('../models/services/NodesFormatter')
const parse = require('babel-eslint/lib/parse')
const config = { ecmaVersion: 2020, sourceType: 'module' };

it('should output exported class definition', () => {
  //Arrange
  const content = "@Fizz class Foo extends Bar {}\nexport default Foo";
  const node = parse(content, config);
  const expectedOutput = 'class Foo:Bar @Fizz default';
  
  //Act
  const actualOutput = formatter.formatNodes(node)

  //Assert
  expect(expectedOutput).toBe(actualOutput)

});