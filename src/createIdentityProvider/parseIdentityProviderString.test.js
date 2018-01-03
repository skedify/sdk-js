import parseIdentityProviderString from './parseIdentityProviderString'

describe('parseIdentityProviderString', () => {
  it('should be possible to parse the string', () => {
    expect(parseIdentityProviderString('type://foo=bar&bar=baz')).toEqual({
      type: 'type',
      options: {
        foo: 'bar',
        bar: 'baz',
      },
    })
  })

  it('should throw an error when there are no options', () => {
    expect(() =>
      parseIdentityProviderString('type://')
    ).toThrowErrorMatchingSnapshot()
  })

  it('should throw an error when there is no type but there are options', () => {
    expect(() =>
      parseIdentityProviderString('://foo=bar&bar=baz')
    ).toThrowErrorMatchingSnapshot()
  })

  it('should throw an error when there is no type and no options', () => {
    expect(() =>
      parseIdentityProviderString('://')
    ).toThrowErrorMatchingSnapshot()
  })

  it('should throw an error when there is an invalid value', () => {
    expect(() => parseIdentityProviderString('')).toThrowErrorMatchingSnapshot()
    expect(() => parseIdentityProviderString()).toThrowErrorMatchingSnapshot()
    expect(() =>
      parseIdentityProviderString(null)
    ).toThrowErrorMatchingSnapshot()
  })
})
