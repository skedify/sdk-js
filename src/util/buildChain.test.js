import buildChain from './buildChain'

describe('buildChain', () => {
  it('should be able to build a simple chain', () => {
    // By default it will use `.` as a separator
    expect(buildChain('abc')).toEqual(['abc'])
  })

  it('should be able to build a chain with two sections', () => {
    expect(buildChain('abc-def', '-')).toEqual(['abc-def', 'abc'])
  })

  it('should be able to build a chain with multiple sections', () => {
    expect(buildChain('abc-def-ghi', '-')).toEqual([
      'abc-def-ghi',
      'abc-def',
      'abc',
    ])
  })
})
