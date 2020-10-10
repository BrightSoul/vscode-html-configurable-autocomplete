const it = require('@jest/globals').it
const expect = require('@jest/globals').expect
const FlattenJsonFormatter = require('../models/services/FlattenJsonFormatter')

it('should format a simple JSON hierarchy', () => {
  // Arrange
  const content = '{\n"a":{\n"bb":\n{"ccc":1}\n}\n}'
  const expectedOutput = '1,0 a\n2,0 a.bb\n3,1 a.bb.ccc'

  // Act
  const actualOutput = FlattenJsonFormatter.parseAndFormat(content)

  // Assert
  expect(actualOutput).toBe(expectedOutput)
})

it('should format a JSON hierarchy with an array', () => {
  // Arrange
  const content = '{\n"a":[\n{"bb":1},\n{"cc":2},\n{"dd":[{"ee":3},\n"ww", "zzz"]}]\n}'
  const expectedOutput = '1,0 a\n2,1 a[0].bb\n3,1 a[1].cc\n4,1 a[2].dd\n4,8 a[2].dd[0].ee\n5,0 a[2].dd[1]\n5,6 a[2].dd[2]'

  // Act
  const actualOutput = FlattenJsonFormatter.parseAndFormat(content)

  // Assert
  expect(actualOutput).toBe(expectedOutput)
})

it('should format a JSON hierarchy and preserve spaces', () => {
  // Arrange
  const content = '{\n  "aa": [\n    {"bb": 1},\n    {"cc": 2},\n    {"dd": [ {"ee": 3}, {}, {} ] }\n  ]\n}'
  const expectedOutput = '1,2 aa\n2,5 aa[0].bb\n3,5 aa[1].cc\n4,5 aa[2].dd\n4,14 aa[2].dd[0].ee\n4,24 aa[2].dd[1]\n4,28 aa[2].dd[2]'

  // Act
  const actualOutput = FlattenJsonFormatter.parseAndFormat(content)

  // Assert
  expect(actualOutput).toBe(expectedOutput)
})

it('should format a JSON hierarchy inline', () => {
  // Arrange
  const content = '{"aa":[{"bb":1},{"cc":2},{"dd":[{"ee":3},{},{},{},"foo"]}]}'
  const expectedOutput = '0,1 aa\n0,8 aa[0].bb\n0,17 aa[1].cc\n0,26 aa[2].dd\n0,33 aa[2].dd[0].ee\n0,41 aa[2].dd[1]\n0,44 aa[2].dd[2]\n0,47 aa[2].dd[3]\n0,50 aa[2].dd[4]'

  // Act
  const actualOutput = FlattenJsonFormatter.parseAndFormat(content)

  // Assert
  expect(actualOutput).toBe(expectedOutput)
})

it('should format a JSON sample', () => {
  // Arrange
  const content = '{\n  "aa": [\n    {"bb": 1},\n    {"cc": 2},\n    {"dd": [ {"ee": 3}, {"ff": 4} ] }\n  ]\n}'
  const expectedOutput = '1,2 aa\n2,5 aa[0].bb\n3,5 aa[1].cc\n4,5 aa[2].dd\n4,14 aa[2].dd[0].ee\n4,25 aa[2].dd[1].ff'

  // Act
  const actualOutput = FlattenJsonFormatter.parseAndFormat(content)

  // Assert
  expect(actualOutput).toBe(expectedOutput)
})

it('should format nested JSON', () => {
  // Arrange
  const content = '{"logging": {"verbose": true, "output": "console", "format": { "template": "{date} {message}" } } }'
  const expectedOutput = '0,1 logging\n0,13 logging.verbose\n0,30 logging.output\n0,51 logging.format\n0,63 logging.format.template'

  // Act
  const actualOutput = FlattenJsonFormatter.parseAndFormat(content)

  // Assert
  expect(actualOutput).toBe(expectedOutput)
})
