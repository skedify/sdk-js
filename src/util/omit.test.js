import omit from './omit'

describe('omit', () => {
  it('should skip non objects', () => {
    expect(omit(undefined)).toBe(undefined)
    expect(omit(null)).toBe(null)
    expect(omit('')).toBe('')
    expect(omit([])).toEqual([])
  })

  it('should not omit anything if no keys to omit are given', () => {
    expect(omit({ foo: 'bar', bar: 'baz', baz: 'foo' })).toMatchSnapshot()
  })

  it('should omit the keys that are given', () => {
    expect(
      omit({ foo: 'bar', bar: 'baz', baz: 'foo' }, ['bar', 'baz'])
    ).toMatchSnapshot()
  })

  it('should return an empty object on omitting everything', () => {
    expect(
      omit({ foo: 'bar', bar: 'baz', baz: 'foo' }, ['foo', 'bar', 'baz'])
    ).toMatchSnapshot()
  })

  it('should not break when trying to omit an non-existing key', () => {
    expect(
      omit({ foo: 'bar', bar: 'baz', baz: 'foo' }, ['fake', 'bar', 'baz'])
    ).toMatchSnapshot()
  })
})
