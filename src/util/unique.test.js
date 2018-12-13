import unique from './unique'

describe('unique', () => {
  it('should make a list of numbers unique', () => {
    expect(unique([1, 2, 1, 1, 2, 3, 4, 5, 5, 5, 5, 6])).toEqual([
      1,
      2,
      3,
      4,
      5,
      6,
    ])
  })

  it('should make a list of strings unique', () => {
    expect(unique(['a', 'a', 'b', 'a', 'c', 'd', 'a', 'b'])).toEqual([
      'a',
      'b',
      'c',
      'd',
    ])
  })
})
