import createIdentityProviderString from './createIdentityProviderString'

describe('createIdentityProviderString', () => {
  it('should be able to create an identity provider string', () => {
    expect(
      createIdentityProviderString('client', {
        Foo: 'Foo',
        Bar: 'Bar',
        Baz: 'http://foo.bar.baz/',
      })
    ).toMatchSnapshot()
  })

  it('should be possible to pass no options at all', () => {
    expect(createIdentityProviderString('client')).toMatchSnapshot()
  })

  it('should filter out undefined values', () => {
    expect(
      createIdentityProviderString('client', {
        Foo: 'Foo',
        Bar: 'Bar',
        Baz: undefined,
      })
    ).toMatchSnapshot()
  })
})
