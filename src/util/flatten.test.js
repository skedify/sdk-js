import flatten from './flatten'

describe('flatten', () => {
  it('should flatten an array', () => {
    expect(flatten([1, [2, [3, [4, 5], 6]]])).toEqual([1, 2, 3, 4, 5, 6])
  })
})
