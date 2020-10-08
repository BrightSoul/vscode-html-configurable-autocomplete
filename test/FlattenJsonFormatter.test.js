const it = require('@jest/globals').it
const expect = require('@jest/globals').expect
const FlattenJsonFormatter = require('../models/services/FlattenJsonFormatter')

it('should format a simple JSON hierarchy', () => {
  // Arrange
  const content = '{\n"a":{\n"bb":\n{"ccc":1}\n}\n}'
  const expectedOutput = '1,4 a\n2,5 a.bb\n3,7 a.bb.ccc'

  // Act
  const actualOutput = FlattenJsonFormatter.parseAndFormat(content)

  // Assert
  expect(actualOutput).toBe(expectedOutput)
})

it('should format a JSON hierarchy with an array', () => {
  // Arrange
  const content = '{\n"a":[\n{"bb":1},\n{"cc":2},\n{"dd":[{"ee":3},\n"zzz"]}]\n}'
  const expectedOutput = '1,4 a\n2,6 a[0].bb\n3,6 a[1].cc\n4,6 a[2].dd\n4,13 a[2].dd[0].ee\n5,1 a[2].dd[1]'

  // Act
  const actualOutput = FlattenJsonFormatter.parseAndFormat(content)

  // Assert
  expect(actualOutput).toBe(expectedOutput)
})
