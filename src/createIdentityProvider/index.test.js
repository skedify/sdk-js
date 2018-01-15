import createIdentityProvider from '.'

describe('createIdentityProvider', () => {
  it('should error when a the idp descriptor is not defined or invalid', () => {
    expect(() => createIdentityProvider()).toThrowErrorMatchingSnapshot()
    expect(() => createIdentityProvider('')).toThrowErrorMatchingSnapshot()
    expect(() =>
      createIdentityProvider('example')
    ).toThrowErrorMatchingSnapshot()
  })

  it('should error when a provider does not exist', () => {
    expect(() =>
      createIdentityProvider('example://some=options')
    ).toThrowErrorMatchingSnapshot()
  })
})
