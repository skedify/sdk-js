import createToken from './createToken'

describe('createToken', () => {
  it('should generate a random string', () => {
    expect(createToken()).toBeDefined()
  })

  it('should remove all dashes from the uuid', () => {
    expect(createToken()).not.toContain('-')
  })
})
