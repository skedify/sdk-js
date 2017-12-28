import validate from './validate'

describe('config # validate', () => {
  it('should error when null is given', () => {
    expect(() => validate(null)).toThrowErrorMatchingSnapshot()
  })
})
