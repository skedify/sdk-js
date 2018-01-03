import createIdentityProviderString from './createIdentityProviderString'

describe('createIdentityProviderString', () => {
  it('should be able to create an identity provider string', () => {
    expect(
      createIdentityProviderString('client', {
        Foo: 'Foo',
        Bar: 'Bar',
        Baz: 'http://foo.bar.baz/',
      })
    ).toEqual('client://Foo=Foo&Bar=Bar&Baz=http%3A%2F%2Ffoo.bar.baz%2F')
  })

  it('should be possible to pass no options at all', () => {
    expect(createIdentityProviderString('client')).toEqual('client://')
  })
})
