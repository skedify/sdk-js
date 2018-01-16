import deepClone from './deepClone'

describe('deepClone', () => {
  it('should create a new copy of a deeply nested object', () => {
    const original = {
      a: {
        b: {
          c: 3,
          d: 'abc',
          e: [4, 5, 6],
        },
      },
    }

    const copy = deepClone(original)
    expect(original).toEqual(copy)
    expect(original).not.toBe(copy)
    expect(original.a).not.toBe(copy.a)
    expect(original.a.b).not.toBe(copy.a.b)
    expect(original.a.b.c).toBe(copy.a.b.c)
    expect(original.a.b.d).toBe(copy.a.b.d)
    expect(original.a.b.e).not.toBe(copy.a.b.e)
    expect(original.a.b.e[0]).toBe(copy.a.b.e[0])
    expect(original.a.b.e[1]).toBe(copy.a.b.e[1])
    expect(original.a.b.e[2]).toBe(copy.a.b.e[2])
  })
})
