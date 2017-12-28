import pick from './pick'

describe('pick', () => {
  it('should be able to pick items from an array', () => {
    const array = [1, 2, 3, 4, 5]
    const toPick = [3, 4, 5, 6, 7]

    expect(pick(array, ...toPick)).toEqual([3, 4, 5])
  })

  it('should be able to pick items from an object', () => {
    const object = {
      foo: 'foo',
      bar: 'bar',
      baz: 'baz',
    }

    expect(pick(object, 'foo', 'baz')).toEqual({
      foo: 'foo',
      baz: 'baz',
    })
  })
})
