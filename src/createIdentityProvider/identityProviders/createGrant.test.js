import { createGrant } from './createGrant'
import { createDefaultLogger } from '../../util/createDefaultLogger'
import { set } from '../../secret'

describe('createGrant', () => {
  const instance = {} // Let's mock the instance for now
  set(instance, { logger: createDefaultLogger() })

  it('should error when no parameters are provided', () => {
    const MyIdentityProvider = createGrant('my_identity_provider')

    expect(() => new MyIdentityProvider()).toThrowErrorMatchingSnapshot()
  })

  it('should be possible to create an identity provider without required or optional parameters', () => {
    const MyIdentityProvider = createGrant('my_identity_provider')
    const myIdentityProviderInstance = new MyIdentityProvider(instance, {
      realm: 'some-realm', // A realm is required though
    })

    expect(myIdentityProviderInstance).toBeInstanceOf(MyIdentityProvider)
  })

  it('should be possible to create an identity provider without required or optional parameters, error on an unnecessary parameter', () => {
    const MyIdentityProvider = createGrant('my_identity_provider')

    expect(
      () =>
        new MyIdentityProvider(instance, {
          realm: 'some-realm', // A realm is required though
          unnecessary_key: 'unnecessary_value',
        })
    ).toThrowErrorMatchingSnapshot()
  })

  it('should be possible to create an identity provider without required or optional parameters, error on multiple unnecessary parameters', () => {
    const MyIdentityProvider = createGrant('my_identity_provider')

    expect(
      () =>
        new MyIdentityProvider(instance, {
          realm: 'some-realm', // A realm is required though
          unnecessary_key_1: 'unnecessary_value_1',
          unnecessary_key_2: 'unnecessary_value_2',
        })
    ).toThrowErrorMatchingSnapshot()
  })

  it('should error when a required parameter is missing', () => {
    const MyIdentityProvider = createGrant('my_identity_provider', [
      'required_a',
      'required_b',
    ])

    expect(
      () =>
        new MyIdentityProvider(instance, {
          realm: 'some-realm',
          required_a: 'required a value', // Note that required_b is missing
        })
    ).toThrowErrorMatchingSnapshot()
  })

  it('should error when muliptle required parameters are missing', () => {
    const MyIdentityProvider = createGrant('my_identity_provider', [
      'required_a',
      'required_b',
      'required_c',
    ])

    expect(
      () =>
        new MyIdentityProvider(instance, {
          realm: 'some-realm',
          required_a: 'required a value', // Note that required_b and required_c are missing
        })
    ).toThrowErrorMatchingSnapshot()
  })
})
