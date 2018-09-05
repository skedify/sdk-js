import isObject from './isObject'

describe('isObject', () => {
  it('should mark an object as an object', () => {
    const argument = {}

    expect(isObject(argument)).toBe(true)
  })

  it('should not mark null as an object', () => {
    const argument = null

    expect(isObject(argument)).toBe(false)
  })
})
