import assert from './assert'

describe('assert', () => {
  it('should error when a value is undefined but required', () => {
    const input = {
      foo: 'bar',
      bar: 'baz',
      baz: undefined,
    }

    expect(() => assert('myCall', input)).toThrowErrorMatchingSnapshot()
  })

  it('should succeed when all required props are given', () => {
    const input = {
      foo: 'bar',
      bar: 'baz',
      baz: undefined,
    }

    expect(() => assert('myCall', input, ['foo', 'bar'])).not.toThrow()
  })

  it('should error when two parameters are missing', () => {
    const input = {
      foo: 'bar',
      bar: undefined,
      baz: undefined,
    }

    expect(() => assert('myCall', input)).toThrowErrorMatchingSnapshot()
  })

  it('should error when all parameters are missing', () => {
    const input = {
      foo: undefined,
      bar: undefined,
      baz: undefined,
    }

    expect(() => assert('myCall', input)).toThrowErrorMatchingSnapshot()
  })
})
