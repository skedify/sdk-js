/* eslint-disable max-nested-callbacks, max-statements */
import {
  API,
  installSkedifySDKMock,
  uninstallSkedifySDKMock,
  mockResponse,
  mockNoContent,
  matchRequest,
  mockMatchingURLResponse,
  mostRecentRequest,
  mockedRequests,
} from './build/Skedify.prod'

import * as exported from './constants/exported'

/**
 * We need to make sure that the public API works correctly
 * The tests in this file will only interact with the public API itself
 */
describe('API/Utils', () => {
  it('should expose a util to create an auth_provider object', () => {
    expect(
      API.createAuthProviderString('public_client', {
        Foo: 'Foo',
        Bar: 'Bar',
        Baz: 'http://foo.bar.baz/',
      })
    ).toEqual('public_client://Foo=Foo&Bar=Bar&Baz=http%3A%2F%2Ffoo.bar.baz%2F')
  })

  it('should expose all error types and subtypes on the API object', () => {
    Object.keys(exported).forEach((key) => {
      expect(API).toHaveProperty(key)
      expect(API[key]).toBe(exported[key])
    })
  })

  it('should add the API to the window.Skedify object in browsers', () => {
    expect(window.Skedify).toHaveProperty('API')
  })
})

describe('API/Auth Providers', () => {
  it('should error when the `realm` is not provided for a certain auth provider strategy', () => {
    const auth_provider = API.createAuthProviderString('public_client', {
      client_id: 'someclientidtokengoeshere',
    })

    expect(
      () =>
        new API({
          auth_provider,
          locale: 'nl-BE',
        })
    ).toThrowErrorMatchingSnapshot()
  })

  it('should error when a required parameter is not provided for a certain auth provider strategy', () => {
    const auth_provider = API.createAuthProviderString('public_client', {
      // Missing client id
      realm: 'https://api.example.com',
    })

    expect(
      () =>
        new API({
          auth_provider,
          locale: 'nl-BE',
        })
    ).toThrowErrorMatchingSnapshot()
  })

  it('should error when a parameter is given that is not required or optional or the realm for a certain auth provider strategy', () => {
    const auth_provider = API.createAuthProviderString('public_client', {
      client_id: 'someclientidtokengoeshere',
      realm: 'https://api.example.com',
      unnecessary_key: 'unnecessary_value',
    })

    expect(
      () =>
        new API({
          auth_provider,
          locale: 'nl-BE',
        })
    ).toThrowErrorMatchingSnapshot()
  })

  it('should be possible to use the `public_client` strategy', async () => {
    const auth_provider = API.createAuthProviderString('public_client', {
      client_id: 'someclientidtokengoeshere',
      realm: 'https://api.example.com',
    })

    const SDK = new API({
      auth_provider,
      locale: 'nl-BE',
    })

    installSkedifySDKMock(SDK)

    mockResponse('my subjects data')
    expect(await SDK.subjects()).toMatchSnapshot()

    uninstallSkedifySDKMock(SDK)
  })

  it('should be possible to use the `token` strategy', async () => {
    const auth_provider = API.createAuthProviderString('token', {
      token_type: 'Bearer',
      access_token: 'some-access-token-goes-here',
      realm: 'https://api.example.com',
    })

    const SDK = new API({
      auth_provider,
      locale: 'nl-BE',
    })

    installSkedifySDKMock(SDK)

    // For the identity call that happens in the grant/index.js
    mockResponse([])
    mockResponse('my subjects data')
    expect(await SDK.subjects()).toMatchSnapshot()

    uninstallSkedifySDKMock(SDK)
  })
})

const auth_provider = API.createAuthProviderString('public_client', {
  client_id: 'someclientidtokengoeshere',
  realm: 'https://api.example.com',
})

describe('API/Config', () => {
  // Test setup process
  it('should throw an error when no config is given', () => {
    expect(() => new API()).toThrow()
  })

  it('should throw an error when the mandatory config items are not present', () => {
    expect(() => new API({ locale: 'nl-BE' })).toThrow()
    expect(() => new API({ auth_provider })).toThrow()
  })

  it('should throw when an invalid logger is passed', () => {
    expect(
      () =>
        new API({
          auth_provider,
          locale: 'nl-BE',
          logger: {
            // Missing a bunch of methods ()
            trace() {
              //
            },
          },
        })
    ).toThrow()
  })

  it('should allow correct forms of locale values', () => {
    const valids = [
      'nl',
      'NL',
      'nl-BE',
      'nl-BE-VWV',
      'nl-be',
      'nl-BE-vwv',
      'en',
      'en-us',
      'en-US',
      ['nl', 'en'],
      ['nl-BE', 'en'],
      ['nl-BE', 'en-US'],
      ['nl', 'en-US'],
      ['nl', 'en', 'fr'],
      ['nl-BE-VWV', 'en-US', 'fr-FR'],
    ]

    valids.forEach((locale) => {
      expect(() => new API({ locale, auth_provider })).not.toThrow()
    })
  })

  it('should throw an error when the locale is wrongly formatted', () => {
    const invalids = [
      'nl-BE+VWV', // Because + is not allowed.
      'nl-BE-', // There can not be a lost dash on the end.
      'nl-BE-VWVX', // Because maximum 3 characters in the last place are allowed.
      ['nl-BE+VWV'], // Arrays are valid, but each item must be valid as well
      ['nl-BE-'], // Arrays are valid, but each item must be valid as well
      ['nl-BE-VWVX'], // Arrays are valid, but each item must be valid as well
    ]

    invalids.forEach((locale) => {
      expect(() => new API({ locale, auth_provider })).toThrowError(
        '[CONFIG]: locale is not valid.'
      )
    })
  })

  it('should be possible to read the config', () => {
    const config = {
      auth_provider,
      locale: 'nl-BE',
    }
    const SDK = new API(config)

    expect(SDK.configuration).toEqual(config)
  })

  it('should be possible to merge new config items', () => {
    const SDK = new API({
      auth_provider,
      locale: 'nl-BE',
    })

    SDK.configure({ locale: 'fr-BE' })

    expect(SDK.configuration).toEqual({
      auth_provider,
      locale: 'fr-BE',
    })
  })

  it('should throw errors when merging new invalid config', () => {
    const SDK = new API({
      auth_provider,
      locale: 'nl-BE',
    })

    expect(() => {
      SDK.configure({ locale: undefined })
    }).toThrow()
  })

  it('should throw an error when overriding the whole config object', () => {
    const SDK = new API({
      auth_provider,
      locale: 'nl-BE',
    })

    expect(() => {
      SDK.configuration = {}
    }).toThrowErrorMatchingSnapshot()
  })

  it('should throw an error when overriding items on the configuration object directly', () => {
    const SDK = new API({
      auth_provider,
      locale: 'nl-BE',
    })

    expect(() => {
      SDK.configuration.locale = 'fr-BE'
    }).toThrowErrorMatchingSnapshot()
  })

  it('should be possible to listen for configuration changes', () => {
    const mock = jest.fn()

    const SDK = new API({
      auth_provider,
      locale: 'nl-BE',
    })

    SDK.onConfigurationChange(mock)

    SDK.configure({ locale: 'fr-BE' })

    expect(mock).toHaveBeenCalled()
  })

  it('should throw an error when onConfigurationChange is not passed a function', () => {
    const SDK = new API({
      auth_provider,
      locale: 'nl-BE',
    })

    expect(() => SDK.onConfigurationChange(null)).toThrowErrorMatchingSnapshot()
  })

  it('should be possible to "un"-listen for configuration changes', () => {
    const mock = jest.fn()

    const SDK = new API({
      auth_provider,
      locale: 'nl-BE',
    })

    const unlisten = SDK.onConfigurationChange(mock)
    unlisten()

    SDK.configure({ locale: 'fr-BE' })

    expect(mock).not.toHaveBeenCalled()
  })

  it('should be possible to create an SDK instance', () => {
    const SDK = new API({
      auth_provider: API.createAuthProviderString('public_client', {
        client_id: 'someclientidtokengoeshere',
        realm: 'https://api.example.com',
      }),
      locale: 'nl-BE',
    })

    expect(SDK).toBeInstanceOf(API)
  })

  it('should be possible to create an SDK instance with a list of locales', async () => {
    const SDK = new API({
      auth_provider: API.createAuthProviderString('public_client', {
        client_id: 'someclientidtokengoeshere',
        realm: 'https://api.example.com',
      }),
      locale: ['nl-BE-VWV', 'en-US', 'fr-BE'],
    })

    expect(SDK).toBeInstanceOf(API)

    installSkedifySDKMock(SDK)
    expect(await matchRequest(SDK.identity())).toMatchSnapshot()
    uninstallSkedifySDKMock(SDK)
  })

  it('should be possible to create an SDK instance with a resource_code', () => {
    const SDK = new API({
      auth_provider: API.createAuthProviderString('resource_code', {
        client_id: 'someclientidtokengoeshere',
        realm: 'https://api.example.com',
        code: 'someresourcecode',
      }),
      locale: 'nl-BE',
    })

    expect(SDK).toBeInstanceOf(API)
  })

  it('should be possible to create an SDK instance with default headers', async () => {
    const SDK = new API({
      auth_provider: API.createAuthProviderString('public_client', {
        client_id: 'someclientidtokengoeshere',
        realm: 'http://127.0.0.1',
      }),
      locale: 'nl-BE',
      headers: {
        Host: 'api.example.com',
      },
    })

    installSkedifySDKMock(SDK)

    expect(await matchRequest(SDK.subjects())).toMatchSnapshot()

    uninstallSkedifySDKMock(SDK)
  })

  it('should be possible to define custom domain endpoints per resource', async () => {
    const SDK = new API({
      auth_provider: API.createAuthProviderString('public_client', {
        client_id: 'someclientidtokengoeshere',
        realm: 'https://api.example.com',
      }),
      locale: 'nl-BE',
      resource_domain_map: {
        events: {
          url: 'https://events-api.example.com',
        },
        'users.events': {
          url: 'https://users-events-api.example.com',
        },
      },
    })

    installSkedifySDKMock(SDK)

    expect(await matchRequest(SDK.subjects())).toMatchSnapshot()
    expect(await matchRequest(SDK.events())).toMatchSnapshot()
    expect(await matchRequest(SDK.users(1).events())).toMatchSnapshot()

    // Just to verify that we didn't mutate shared configs
    expect(await matchRequest(SDK.subjects())).toMatchSnapshot()

    uninstallSkedifySDKMock(SDK)
  })

  it('should be possible to set custom headers', async () => {
    const SDK = new API({
      auth_provider: API.createAuthProviderString('public_client', {
        client_id: 'someclientidtokengoeshere',
        realm: 'http://127.0.0.1',
      }),
      locale: 'nl-BE',
      headers: {
        Host: 'api.example.com',
      },
    })

    installSkedifySDKMock(SDK)

    expect(
      await matchRequest(
        SDK.appointments().headers({
          'X-Scheduling-Rules': 'disallow-appointment-overlap',
        })
      )
    ).toMatchSnapshot()

    uninstallSkedifySDKMock(SDK)
  })

  it('should throw when a resource requires a custom domain endpoint when it is not defined', () => {
    const SDK = new API({
      auth_provider: API.createAuthProviderString('public_client', {
        client_id: 'someclientidtokengoeshere',
        realm: 'https://api.example.com',
      }),
      locale: 'nl-BE',
    })

    installSkedifySDKMock(SDK)

    expect(() => SDK.events()).toThrowErrorMatchingSnapshot()

    uninstallSkedifySDKMock(SDK)
  })

  it('should be possible to define custom domain endpoints per resource with headers', async () => {
    const SDK = new API({
      auth_provider: API.createAuthProviderString('public_client', {
        client_id: 'someclientidtokengoeshere',
        realm: 'https://api.example.com',
      }),
      locale: 'nl-BE',
      headers: {
        Host: 'main-api.example.com',
        'X-Hello-Human': 'Hello Human!',
      },
      resource_domain_map: {
        events: {
          url: 'https://events-api.example.com',
          headers: {
            Host: 'events-api-host.example.com',
          },
        },
      },
    })

    installSkedifySDKMock(SDK)

    expect(await matchRequest(SDK.subjects())).toMatchSnapshot()
    expect(await matchRequest(SDK.events())).toMatchSnapshot()

    // Just to verify that we didn't mutate shared configs
    expect(await matchRequest(SDK.subjects())).toMatchSnapshot()

    uninstallSkedifySDKMock(SDK)
  })
})

describe('API', () => {
  let SDK

  beforeAll(() => {
    SDK = new API({
      auth_provider,
      locale: 'nl-BE',
    })
  })

  beforeEach(() => installSkedifySDKMock(SDK))
  afterEach(() => uninstallSkedifySDKMock(SDK))

  it('should expose all available includes on the API instance', () => {
    expect(SDK.include).toBeDefined()

    // The full object definition
    expect(SDK.include).toMatchSnapshot()

    // Some examples: note that we use interpolation to trigger the .toString() method
    expect(`${SDK.include.subject}`).toEqual('subject')
    expect(`${SDK.include.subject.subject_category}`).toEqual(
      'subject.subject_category'
    )
  })

  it('should invoke a call when .then is called', () => {
    mockResponse([
      {
        id: 1,
        title: 'My Subject',
        description: 'My super interesting subject',
      },
      {
        id: 2,
        title: 'Your Subject',
        description: 'Your super interesting subject',
      },
    ])

    const mock = jest.fn()

    expect.assertions(1)

    return SDK.subjects()
      .then(mock, mock)
      .then(() => {
        expect(mock).toHaveBeenCalled()
      })
  })

  it('should invoke a call when .catch is called', () => {
    // It propagates to the .then call
    mockResponse([
      {
        id: 1,
        title: 'My Subject',
        description: 'My super interesting subject',
      },
      {
        id: 2,
        title: 'Your Subject',
        description: 'Your super interesting subject',
      },
    ])

    const mock = jest.fn()

    expect.assertions(1)

    return SDK.subjects()
      .catch(mock)
      .then(() => {
        expect(mock).not.toHaveBeenCalled()
      })
  })

  it('should invoke a call once when .then is called multiple times', async () => {
    const mock_data = [{ id: '1' }]
    // If the SDK makes multiple calls, this test will fail with an "Async callback was not invoked within the 5000ms timeout specified by jest.setTimeout"
    mockResponse(mock_data)

    const call = SDK.subjects()
    const [result1, result2, result3] = await Promise.all([call, call, call])

    expect(result1.data).toEqual(mock_data)
    expect(result2.data).toEqual(mock_data)
    expect(result3.data).toEqual(mock_data)
  })

  it('should invoke a call once when .catch is called multiple times', async () => {
    const mock_data = [{ id: '1' }]
    // If the SDK makes multiple calls, this test will fail with an "Async callback was not invoked within the 5000ms timeout specified by jest.setTimeout"
    mockResponse(mock_data)

    const call = SDK.subjects()
    const result1 = await call.catch((err) => err)
    const result2 = await call.catch((err) => err)
    const result3 = await call.catch((err) => err)

    expect(result1.data).toEqual(mock_data)
    expect(result2.data).toEqual(mock_data)
    expect(result3.data).toEqual(mock_data)
  })

  it('should be possible to invoke a normal fetch first, and after that create a resource', async () => {
    const call = SDK.subjects()

    // Fetch all subjects
    expect(await matchRequest(call)).toMatchSnapshot()

    // Create a new subject using the same initial promise setup
    expect(
      await matchRequest(
        call.new({ title: 'Subject Title' }).then((subject) => subject.create())
      )
    ).toMatchSnapshot()
  })

  it('should reflect configuration changes in the request (locale)', async () => {
    expect(await matchRequest(SDK.subjects())).toMatchSnapshot()

    const before = SDK.configuration

    SDK.configure({ locale: 'fr-BE' })

    expect(await matchRequest(SDK.subjects())).toMatchSnapshot()

    SDK.configure(before)
  })

  it('should not reflect configuration changes in another instance (locale)', async () => {
    expect(await matchRequest(SDK.subjects())).toMatchSnapshot()
    const SDK2 = new API({
      auth_provider,
      locale: 'fr-BE',
    })

    expect(await matchRequest(SDK.subjects())).toMatchSnapshot()
    installSkedifySDKMock(SDK2)

    expect(await matchRequest(SDK2.subjects())).toMatchSnapshot()
    uninstallSkedifySDKMock(SDK2)
  })

  it('should reflect configuration changes in the request (auth_provider)', async () => {
    expect(await matchRequest(SDK.subjects())).toMatchSnapshot()

    const before = SDK.configuration

    SDK.configure({
      auth_provider: API.createAuthProviderString('public_client', {
        client_id: 'someclientidtokengoeshere',
        realm: 'https://api.other.example.com',
      }),
    })

    expect(await matchRequest(SDK.subjects())).toMatchSnapshot()

    SDK.configure(before)
  })

  it('should be possible to add a response interceptor before the call is made', async () => {
    const mock = jest.fn()

    await matchRequest(SDK.subjects().addResponseInterceptor(mock))

    expect(mock).toHaveBeenCalled()
  })

  it('should throw an error when an interceptor is added but it is not a function', () => {
    expect(() =>
      SDK.subjects().addResponseInterceptor(null)
    ).toThrowErrorMatchingSnapshot()
  })

  it('should convert all the `id` and `XXX_id` keys to strings', async () => {
    mockResponse([
      { id: 1, foo: 'foo' },
      {
        id: 2,
        bar: 'bar',
        deep: [{ office_id: 5 }],
      },
    ])

    expect.assertions(1)

    const { data } = await SDK.subjects()

    expect(data).toEqual([
      { id: '1', foo: 'foo' },
      {
        id: '2',
        bar: 'bar',
        deep: [{ office_id: '5' }],
      },
    ])
  })

  it('should be possible to setup the language on a request level basis', async () => {
    expect(await matchRequest(SDK.subjects().locale('fr-BE'))).toMatchSnapshot()

    // Consecutive calls without the override should maintain the original languge.
    expect(await matchRequest(SDK.subjects())).toMatchSnapshot()
  })

  it('should not use a proxy url when none is given', async () => {
    const SDK2 = new API({
      auth_provider,
      locale: 'nl-BE',
    })

    installSkedifySDKMock(SDK2, { mockProxyCall: false })

    // No proxy url is returned
    // Fallback/Default url should be used
    mockMatchingURLResponse(/integrations/)
    mockMatchingURLResponse(/subjects/, [])

    await SDK2.subjects()

    expect(mockedRequests()).toMatchSnapshot()

    uninstallSkedifySDKMock(SDK2)
  })

  it('should use the proxy url when given', async () => {
    const SDK2 = new API({
      auth_provider,
      locale: 'nl-BE',
    })

    installSkedifySDKMock(SDK2, { mockProxyCall: false })

    // A proxy url is returned
    // The proxy url should be used for the request
    mockMatchingURLResponse(/integrations/, {
      settings: { url: 'https://api-proxy.example.com' },
    })
    mockMatchingURLResponse(/subjects/, [])

    await SDK2.subjects()

    expect(mockedRequests()).toMatchSnapshot()

    uninstallSkedifySDKMock(SDK2)
  })

  it('should use the proxy url when given for the token grant', async () => {
    const auth_provider_token = API.createAuthProviderString('token', {
      token_type: 'Bearer',
      access_token: 'some-access-token-goes-here',
      realm: 'https://api.example.com',
    })

    const SDK2 = new API({
      auth_provider: auth_provider_token,
      locale: 'nl-BE',
    })

    installSkedifySDKMock(SDK2, { mockProxyCall: false })

    // A proxy url is returned
    // The proxy url should be used for the request
    mockMatchingURLResponse(/integrations/, {
      settings: { url: 'https://api-proxy.example.com' },
    })
    // See grant/index.js
    mockMatchingURLResponse(/identity/, [])
    mockMatchingURLResponse(/subjects/, [])

    await SDK2.subjects()

    expect(mockedRequests()).toMatchSnapshot()

    uninstallSkedifySDKMock(SDK2)
  })

  it('should not use a proxy url when none is given for the token grant', async () => {
    const auth_provider_token = API.createAuthProviderString('token', {
      token_type: 'Bearer',
      access_token: 'some-access-token-goes-here',
      realm: 'https://api.example.com',
    })

    const SDK2 = new API({
      auth_provider: auth_provider_token,
      locale: 'nl-BE',
    })

    installSkedifySDKMock(SDK2, { mockProxyCall: false })

    // No proxy url is returned
    // Fallback/Default url should be used
    mockMatchingURLResponse(/integrations/)
    // See grant/index.js
    mockMatchingURLResponse(/identity/, [])
    mockMatchingURLResponse(/subjects/, [])

    await SDK2.subjects()

    expect(mockedRequests()).toMatchSnapshot()

    uninstallSkedifySDKMock(SDK2)
  })

  describe('API/Response', () => {
    it('should normalize the response when the call succeeds', async () => {
      mockResponse([])
      expect(await SDK.identity()).toMatchSnapshot()
    })

    it('should normalize the response when the call fails', async () => {
      const data = []
      const meta = []
      const warnings = []
      const errors = undefined

      mockResponse(data, meta, warnings, errors, 422)

      expect.assertions(1)

      try {
        await SDK.appointments()
          .new({})
          .then((appointment) => appointment.create())
      } catch (err) {
        expect(err).toMatchSnapshot()
      }
    })

    it('should try to recover from 401 errors by re-trying to authorize', async () => {
      const data = []
      const meta = []
      const warnings = []

      mockMatchingURLResponse(/appointments/, data, meta, warnings, 401)
      mockMatchingURLResponse(/appointments/, data, meta, warnings, 200)

      expect(await SDK.appointments()).toMatchSnapshot()
    })
  })

  describe('API/Resources', () => {
    it('should warn the user when a resource is deprecated', async () => {
      const mock = jest.spyOn(console, 'warn').mockImplementation(jest.fn)
      await matchRequest(SDK.contacts(1).offices())

      expect(mock).toHaveBeenCalledTimes(1)
      expect(mock).toHaveBeenCalledWith(
        'The call to .contacts(1).offices() is deprecated.'
      )

      mock.mockRestore()
    })

    it('should expose a .subjects() resource method', () => {
      expect(SDK.subjects).toBeInstanceOf(Function)
    })

    it('should be possible to request a subjects collection', async () => {
      expect(await matchRequest(SDK.subjects())).toMatchSnapshot()
    })

    it('should be possible to request a single subject', async () => {
      expect(await matchRequest(SDK.subjects(1))).toMatchSnapshot()
    })

    it('should be possible to add includes to the subjects collection', async () => {
      expect(
        await matchRequest(
          SDK.subjects().include(
            SDK.include.questions,
            SDK.include.subject_category
          )
        )
      ).toMatchSnapshot()
    })

    it('should be possible to make subsequent calls to include to add multiple includes', async () => {
      expect(
        await matchRequest(
          SDK.subjects()
            .include(SDK.include.questions)
            .include(SDK.include.subject_category)
        )
      ).toMatchSnapshot()
    })

    it('should make all the includes unique', async () => {
      expect(
        await matchRequest(
          SDK.subjects()
            .include(SDK.include.questions, SDK.include.questions)
            .include(SDK.include.subject_category, SDK.include.questions)
        )
      ).toMatchSnapshot()
    })

    it('should be possible to add includes to the a single subject', async () => {
      expect(
        await matchRequest(
          SDK.subjects(1).include(
            SDK.include.questions,
            SDK.include.subject_category
          )
        )
      ).toMatchSnapshot()
    })

    it('should throw an error when including a value that is not defined on the resource', () => {
      expect(() =>
        SDK.subjects(1).include('invalid')
      ).toThrowErrorMatchingSnapshot()
    })

    it('should throw an error when including a value but there are no includes defined on the resource', () => {
      expect(() =>
        SDK.timetable({
          subject: 316,
          office: 1308,
          start: '2017-12-21',
          end: '2017-12-26',
        }).include('invalid')
      ).toThrowErrorMatchingSnapshot()
    })

    it('should be possible to use subresources', async () => {
      expect(await matchRequest(SDK.subjects(1).questions())).toMatchSnapshot()
    })

    it('should be possible to use subresources with its id', async () => {
      expect(await matchRequest(SDK.subjects(1).questions(2))).toMatchSnapshot()
    })

    it('should be possible to use subresources by id and includes', async () => {
      expect(
        await matchRequest(
          SDK.subjects(1).questions(2).include(SDK.include.options)
        )
      ).toMatchSnapshot()
    })

    it('should be possible to disable certain actions (update) on a resource', () => {
      expect(() =>
        SDK.insights('cumulio').auth().update({
          id: 'new id',
        })
      ).toThrowErrorMatchingSnapshot()
    })

    it('should be possible to disable certain actions (delete) on a resource', () => {
      expect(() =>
        SDK.insights('cumulio').auth().delete()
      ).toThrowErrorMatchingSnapshot()
    })

    it('should be possible to disable certain actions (new) on a resource', () => {
      expect(() =>
        SDK.identity().new({
          id: 'new identity id',
        })
      ).toThrowErrorMatchingSnapshot()
    })

    it('should be possible to disable certain actions (new) but the other methods should still be possible', () => {
      expect(() =>
        SDK.identity().new({
          id: 'new identity id',
        })
      ).toThrowErrorMatchingSnapshot()
      expect(() =>
        SDK.identity().update({
          id: 'new identity id',
        })
      ).toThrowErrorMatchingSnapshot()
      expect(() => SDK.identity().delete()).toThrowErrorMatchingSnapshot()
      expect(() => SDK.identity()).not.toThrowError()
    })

    it('should throw an error when a subresource is used but no id is provided', () => {
      expect(() => SDK.subjects().questions()).toThrowErrorMatchingSnapshot()
    })

    it('should throw an error when a subresource with id is used but no parent id is provided', () => {
      expect(() => SDK.subjects().questions(123)).toThrowErrorMatchingSnapshot()
    })

    it('should throw an error when include is used before the subresource is used', () => {
      expect(() =>
        SDK.subjects(1).include(SDK.include.subject_category).questions()
      ).toThrowErrorMatchingSnapshot()

      expect(() =>
        SDK.subjects(1).include(SDK.include.subject_category).questions(123)
      ).toThrowErrorMatchingSnapshot()
    })

    it('should be possible to add filters to a resource', async () => {
      expect(
        await matchRequest(
          SDK.subjects(1).filter((item) =>
            item.schedulable_with_contact(['1', '2'])
          )
        )
      ).toMatchSnapshot()
    })

    it('should be possible to add filters to a resource that has special filter syntax', async () => {
      expect(
        await matchRequest(
          SDK.integrations().filter((item) => item.type('cumulio'))
        )
      ).toMatchSnapshot()
    })

    it('should filter out undefined values when using filters', async () => {
      expect(
        await matchRequest(
          SDK.subjects(1).filter((item) =>
            item.schedulable_with_contact(['1', undefined, '2'])
          )
        )
      ).toMatchSnapshot()
    })

    it('should throw an error when filter did not receive a callback', () => {
      expect(() => SDK.subjects(1).filter()).toThrowErrorMatchingSnapshot()
    })

    it('should throw an error when calling a non existing filter function', () => {
      expect(() =>
        SDK.subjects(1).filter((item) => item.nonExistingMethod())
      ).toThrowErrorMatchingSnapshot()
    })

    it('should throw an error when calling a non existing filter function and one of the defined filters is using an object alias', () => {
      expect(() =>
        SDK.integrations().filter((item) => item.nonExistingMethod())
      ).toThrowErrorMatchingSnapshot()
    })

    it('should throw a slightly different error when calling a non existing filter function when there are no possible filters for this resource', () => {
      expect(() =>
        SDK.accessTokens().filter((item) => item.nonExistingMethod())
      ).toThrowErrorMatchingSnapshot()
    })

    it('should default to true when a filter is given with no value', async () => {
      expect(
        await matchRequest(SDK.subjects(1).filter((item) => item.schedulable()))
      ).toMatchSnapshot()
    })

    it('should be possible to merge filters with the same name', async () => {
      expect(
        await matchRequest(
          SDK.subjects(1).filter((item) =>
            item
              .schedulable_with_contact(['1', '2'])
              .schedulable_with_contact(['2', '3'])
          )
        )
      ).toMatchSnapshot()
    })

    it('should be possible to use a shorthand for using external ids', async () => {
      expect(
        await matchRequest(SDK.customers('external://abc123'), [
          {
            id: 123,
            external: 'abc123',
          },
        ])
      ).toMatchSnapshot()
    })

    it('should result in a single resource response when using external identifiers', async () => {
      mockResponse([
        {
          id: 123,
          external_id: 'abc123',
        },
      ])

      expect(await SDK.customers('external://abc123')).toMatchSnapshot()
    })

    it('should throw an error when an external://abc123 call returns multiple records', () => {
      mockResponse([
        {
          id: 123,
          external_id: 'abc123',
        },
        {
          id: 456,
          external_id: 'abc123',
        },
      ])

      expect.assertions(3)

      return SDK.customers('external://abc123').catch((error) => {
        expect(error).toMatchSnapshot()
        expect(error.response.data).toMatchSnapshot()
        expect(error.response.data).toBe(error.alternatives)
      })
    })

    it('should throw an error when an external://abc123 call returns no records', () => {
      mockResponse([])

      expect.assertions(2)

      return SDK.customers('external://abc123').catch((error) => {
        expect(error).toMatchSnapshot()
        expect(error.response.data).toMatchSnapshot()
      })
    })

    it('should be possible to create an entity', async () => {
      expect(
        await matchRequest(
          SDK.appointments()
            .new({
              subject_id: 123,
              office_id: 456,
              meeting_type: 'office',
              answers: [],
              initiated_by_type: 'customer',
              customer: {},
              possibilities: [],
              recaptcha:
                'The response goes here, internally this gets mapped to a header',
            })
            .then((appointment) => appointment.create())
        )
      ).toMatchSnapshot()
    })

    it('should be possible to create an entity without recaptcha header', async () => {
      // Note, the API itself might still reject the creation of the entity
      expect(
        await matchRequest(
          SDK.appointments()
            .new({
              subject_id: 123,
              office_id: 456,
              meeting_type: 'office',
              answers: [],
              initiated_by_type: 'customer',
              customer: {},
              possibilities: [],
            })
            .then((appointment) => appointment.create())
        )
      ).toMatchSnapshot()
    })

    it('should be possible to create an entity and add includes', async () => {
      expect(
        await matchRequest(
          SDK.appointments()
            .include(SDK.include.subject)
            .new({
              subject_id: 123,
              office_id: 456,
              meeting_type: 'office',
              answers: [],
              initiated_by_type: 'customer',
              customer: {},
              possibilities: [],
              recaptcha:
                'The response goes here, internally this gets mapped to a header',
            })
            .then((appointment) => appointment.create())
        )
      ).toMatchSnapshot()
    })

    it('should be possible to patch an entity', async () => {
      expect(
        await matchRequest(
          SDK.appointments(1207)
            .update({
              state: 'cancelled',
              cancelled_by_type: 'customer',
              cancelled_by_id: 'customer id goes here',
            })
            .then((appointment) => appointment.save())
        )
      ).toMatchSnapshot()
    })

    it('should be possible to delete an entity', async () => {
      expect(
        await matchRequest(
          SDK.appointments(1207)
            .delete()
            .then((appointment) => appointment.delete())
        )
      ).toMatchSnapshot()
    })

    it('should be possible to patch an entity and add includes', async () => {
      expect(
        await matchRequest(
          SDK.appointments(1207)
            .include(SDK.include.customer)
            .update({
              state: 'cancelled',
              cancelled_by_type: 'customer',
              cancelled_by_id: 'customer id goes here',
            })
            .then((appointment) => appointment.save())
        )
      ).toMatchSnapshot()
    })

    it('should be possible to read and patch when branched from the same base promise (do not mutate original promise)', async () => {
      /** This test will make sure that we don't mutate the original promise */
      const base = SDK.appointments(1207)

      const patchRequest = await matchRequest(
        base
          .update({
            state: 'cancelled',
            cancelled_by_type: 'customer',
            cancelled_by_id: 'customer id goes here',
          })
          .then((appointment) => appointment.save())
      )
      const readRequest = await matchRequest(base)

      expect(patchRequest).toMatchSnapshot()
      expect(readRequest).toMatchSnapshot()
    })
  })

  it('should be possible to create an employee', async () => {
    // Without an extra header
    expect(
      await matchRequest(
        SDK.employees()
          .new({})
          .then((employee) => employee.create())
      )
    ).toMatchSnapshot()
  })

  it('should be possible to create an employee without activation email', async () => {
    // Without an extra header
    expect(
      await matchRequest(
        SDK.employees()
          .new({
            suppress_activation_email: true,
          })
          .then((employee) => employee.create())
      )
    ).toMatchSnapshot()
  })

  describe('actions', () => {
    const IGNORE_META = {}
    const IGNORE_WARNINGS = []

    function factory(amount, creator) {
      return [...Array(amount).keys()].map(creator)
    }

    describe('create', () => {
      it('should be possible to create a single resource', async () => {
        expect(
          await matchRequest(
            SDK.subjects()
              .new({ title: 'subject title' })
              .then(({ create }) => create())
          )
        ).toMatchSnapshot()
      })

      describe('bulk', () => {
        it('should be possible to create multiple resources at once', async () => {
          const ENTITIES_TO_CREATE = 2

          expect(
            await matchRequest(
              SDK.subjects()
                .new(
                  factory(ENTITIES_TO_CREATE, (idx) => ({
                    title: `subject title ${idx + 1}`,
                  }))
                )
                .then(({ create }) => create())
            )
          ).toMatchSnapshot()
        })

        describe('batching', () => {
          it('should be possible to create multiple groups of resources at once', async () => {
            const ENTITIES_TO_CREATE = 5
            const data = factory(ENTITIES_TO_CREATE, (idx) => ({
              title: `subject title ${idx + 1}`,
            }))

            // TODO: How do we make this more clear? For tests we group by 3 by
            //       default. This means that we need 2 mockResponses because
            //       there should be a group of 3 and a group of 2.
            mockResponse(data.slice(0, 3))
            mockResponse(data.slice(3, 6))

            const response = await SDK.subjects()
              .new(data)
              .then(({ create }) => create())

            // Expecting that the data of the response is stitched back together
            // correctly.
            expect(response.data).toHaveLength(ENTITIES_TO_CREATE)
            expect(response.data).toEqual(data)
          })

          it('should be possible to create multiple groups of resources at once with validation errors in the first group', async () => {
            const ENTITIES_TO_CREATE = 5
            const data = factory(ENTITIES_TO_CREATE, (idx) => ({
              title: `subject title ${idx + 1}`,
            }))

            // TODO: How do we make this more clear? For tests we group by 3 by
            //       default. This means that we need 2 mockResponses because
            //       there should be a group of 3 and a group of 2.
            mockResponse(
              [...data.slice(0, 1), null, ...data.slice(2, 3)],
              IGNORE_META,
              IGNORE_WARNINGS,
              [{ index: 1, message: 'Something is wrong' }],
              422
            )
            mockResponse(data.slice(3, 6))

            const response = await SDK.subjects()
              .new(data)
              .then(({ create }) => create())

            // Expecting that the data of the response is stitched back together
            // correctly.
            expect(response.data).toHaveLength(ENTITIES_TO_CREATE)
            expect(response.data).toEqual([
              ...data.slice(0, 1),
              null,
              ...data.slice(2, 6),
            ])
            expect(response.errors).toEqual([
              { index: 1, message: 'Something is wrong' },
            ])
          })

          it('should be possible to create multiple groups of resources at once with validation errors in the last group', async () => {
            const ENTITIES_TO_CREATE = 5
            const data = factory(ENTITIES_TO_CREATE, (idx) => ({
              title: `subject title ${idx + 1}`,
            }))

            // TODO: How do we make this more clear? For tests we group by 3 by
            //       default. This means that we need 2 mockResponses because
            //       there should be a group of 3 and a group of 2.
            mockResponse(data.slice(0, 3))
            mockResponse(
              [null, ...data.slice(4, 5)],
              IGNORE_META,
              IGNORE_WARNINGS,
              [{ index: 0, message: 'Something is wrong' }],
              422
            )

            const response = await SDK.subjects()
              .new(data)
              .then(({ create }) => create())

            // Expecting that the data of the response is stitched back together
            // correctly.
            expect(response.data).toHaveLength(ENTITIES_TO_CREATE)

            // We want the data, with the error hole!
            expect(response.data).toEqual([
              ...data.slice(0, 3),
              null,
              ...data.slice(4, 5),
            ])

            // We want the errors with updated indexes
            expect(response.errors).toEqual([
              // The index should be increased because of the first group!
              {
                index:
                  3 /* Previous group data length */ +
                  0 /* Index of error in this group */,
                message: 'Something is wrong',
              },
            ])
          })
        })
      })
    })

    describe('update', () => {
      it('should be possible to update a single resource', async () => {
        expect(
          await matchRequest(
            SDK.subjects(1)
              .update({ title: 'updated title' })
              .then(({ save }) => save())
          )
        ).toMatchSnapshot()
      })

      describe('bulk', () => {
        it('should be possible to update multiple resources at once', async () => {
          const ENTITIES_TO_UPDATE = 2

          expect(
            await matchRequest(
              SDK.subjects(/* Note that this id is omitted */)
                .update(
                  // Note that this is an array, each item MUST include an id
                  factory(ENTITIES_TO_UPDATE, (idx) => ({
                    id: `${idx + 1}`,
                    title: `updated title ${idx + 1}`,
                  }))
                )
                .then(({ save }) => save())
            )
          ).toMatchSnapshot()
        })

        describe('batching', () => {
          it('should be possible to update multiple groups of resources at once', async () => {
            const ENTITIES_TO_UPDATE = 5
            const data = factory(ENTITIES_TO_UPDATE, (idx) => ({
              id: `${idx + 1}`,
              title: `updated title ${idx + 1}`,
            }))

            // TODO: How do we make this more clear? For tests we group by 3 by
            //       default. This means that we need 2 mockResponses because
            //       there should be a group of 3 and a group of 2.
            mockResponse(data.slice(0, 3))
            mockResponse(data.slice(3, 6))

            const response = await SDK.subjects()
              .update(data)
              .then(({ save }) => save())

            // Expecting that the data of the response is stitched back together
            // correctly.
            expect(response.data).toHaveLength(ENTITIES_TO_UPDATE)
            expect(response.data).toEqual(data)
          })

          it('should be possible to update multiple groups of resources at once with validation errors in the first group', async () => {
            const ENTITIES_TO_UPDATE = 5
            const data = factory(ENTITIES_TO_UPDATE, (idx) => ({
              id: `${idx + 1}`,
              title: `updated title ${idx + 1}`,
            }))

            // TODO: How do we make this more clear? For tests we group by 3 by
            //       default. This means that we need 2 mockResponses because
            //       there should be a group of 3 and a group of 2.
            mockResponse(
              [...data.slice(0, 1), null, ...data.slice(2, 3)],
              IGNORE_META,
              IGNORE_WARNINGS,
              [{ index: 1, message: 'Something is wrong' }],
              422
            )
            mockResponse(data.slice(3, 6))

            const response = await SDK.subjects()
              .update(data)
              .then(({ save }) => save())

            // Expecting that the data of the response is stitched back together
            // correctly.
            expect(response.data).toHaveLength(ENTITIES_TO_UPDATE)
            expect(response.data).toEqual([
              ...data.slice(0, 1),
              null,
              ...data.slice(2, 6),
            ])
            expect(response.errors).toEqual([
              { index: 1, message: 'Something is wrong' },
            ])
          })

          it('should be possible to update multiple groups of resources at once with validation errors in the last group', async () => {
            const ENTITIES_TO_UPDATE = 5
            const data = factory(ENTITIES_TO_UPDATE, (idx) => ({
              id: `${idx + 1}`,
              title: `updated title ${idx + 1}`,
            }))

            // TODO: How do we make this more clear? For tests we group by 3 by
            //       default. This means that we need 2 mockResponses because
            //       there should be a group of 3 and a group of 2.
            mockResponse(data.slice(0, 3))
            mockResponse(
              [null, ...data.slice(4, 5)],
              IGNORE_META,
              IGNORE_WARNINGS,
              [{ index: 0, message: 'Something is wrong' }],
              422
            )

            const response = await SDK.subjects()
              .update(data)
              .then(({ save }) => save())

            // Expecting that the data of the response is stitched back together
            // correctly.
            expect(response.data).toHaveLength(ENTITIES_TO_UPDATE)

            // We want the data, with the error hole!
            expect(response.data).toEqual([
              ...data.slice(0, 3),
              null,
              ...data.slice(4, 5),
            ])

            // We want the errors with updated indexes
            expect(response.errors).toEqual([
              // The index should be increased because of the first group!
              {
                index:
                  3 /* Previous group data length */ +
                  0 /* Index of error in this group */,
                message: 'Something is wrong',
              },
            ])
          })
        })
      })
    })

    describe('delete', () => {
      it('should be possible to delete a single resource', async () => {
        expect(
          await matchRequest(
            SDK.subjects(1)
              .delete()
              .then((subjects) => subjects.delete())
          )
        ).toMatchSnapshot()
      })

      describe('bulk', () => {
        it('should be possible to delete multiple resources at once', async () => {
          const ENTITIES_TO_DELETE = 2

          expect(
            await matchRequest(
              SDK.subjects(factory(ENTITIES_TO_DELETE, (idx) => `${idx + 1}`))
                .delete()
                .then((subjects) => subjects.delete())
            )
          ).toMatchSnapshot()
        })

        describe('batching', () => {
          it('should be possible to delete multiple groups of resources at once', async () => {
            const ENTITIES_TO_DELETE = 5
            const data = factory(ENTITIES_TO_DELETE, (idx) => `${idx + 1}`)

            // TODO: How do we make this more clear? For tests we group by 3 by
            //       default. This means that we need 2 mockResponses because
            //       there should be a group of 3 and a group of 2.
            mockNoContent()
            mockNoContent()

            const response = await SDK.subjects(data)
              .delete()
              .then((subjects) => subjects.delete())

            // Every delete was successful, this means that a `DELETE` will
            // return a 204 No Content
            expect(response.data).toEqual(undefined)
          })

          it('should be possible to delete multiple groups of resources at once with validation errors in the first group', async () => {
            const ENTITIES_TO_DELETE = 5
            const data = factory(ENTITIES_TO_DELETE, (idx) => `${idx + 1}`)

            // TODO: How do we make this more clear? For tests we group by 3 by
            //       default. This means that we need 2 mockResponses because
            //       there should be a group of 3 and a group of 2.
            mockResponse(
              [...data.slice(0, 1), null, ...data.slice(2, 3)],
              IGNORE_META,
              IGNORE_WARNINGS,
              [{ index: 1, message: 'Something is wrong' }],
              422
            )
            mockNoContent()

            const response = await SDK.subjects(data)
              .delete()
              .then((subjects) => subjects.delete())

            // Expecting that the data of the response is stitched back together
            // correctly.
            expect(response.data).toHaveLength(ENTITIES_TO_DELETE)
            expect(response.data).toEqual([
              ...data.slice(0, 1),
              null,
              ...data.slice(2, 6),
            ])
            expect(response.errors).toEqual([
              { index: 1, message: 'Something is wrong' },
            ])
          })

          it('should be possible to delete multiple groups of resources at once with validation errors in the last group', async () => {
            const ENTITIES_TO_DELETE = 5
            const data = factory(ENTITIES_TO_DELETE, (idx) => `${idx + 1}`)

            // TODO: How do we make this more clear? For tests we group by 3 by
            //       default. This means that we need 2 mockResponses because
            //       there should be a group of 3 and a group of 2.
            mockNoContent()
            mockResponse(
              [null, ...data.slice(4, 5)],
              IGNORE_META,
              IGNORE_WARNINGS,
              [{ index: 0, message: 'Something is wrong' }],
              422
            )

            const response = await SDK.subjects(data)
              .delete()
              .then((subjects) => subjects.delete())

            // Expecting that the data of the response is stitched back together
            // correctly.
            expect(response.data).toHaveLength(ENTITIES_TO_DELETE)

            // We want the data, with the error hole!
            expect(response.data).toEqual([
              ...data.slice(0, 3),
              null,
              ...data.slice(4, 5),
            ])

            // We want the errors with updated indexes
            expect(response.errors).toEqual([
              // The index should be increased because of the first group!
              {
                index:
                  3 /* Previous group data length */ +
                  0 /* Index of error in this group */,
                message: 'Something is wrong',
              },
            ])
          })
        })
      })
    })
  })

  describe('API/testUtils', () => {
    describe('mockResponse', () => {
      it('should be possible to mock a response (and get defaults)', async () => {
        mockResponse()

        expect(await SDK.appointments()).toMatchSnapshot()
      })

      it('should be possible to mock a response', async () => {
        mockResponse(
          'data goes here',
          'meta data goes here',
          'warnings go here',
          undefined,
          223 // Some random 2XX status code to prove that we can mock it
        )

        expect(await SDK.appointments()).toMatchSnapshot()
      })

      it('should be possible to mock responses of multiple calls', async () => {
        mockResponse('my appointments data')
        expect(await SDK.appointments()).toMatchSnapshot()

        mockResponse('my subjects data')
        expect(await SDK.subjects()).toMatchSnapshot()
      })

      it('should be possible to mock responses of multiple calls that run simultaneously', async () => {
        mockMatchingURLResponse(/appointments/, 'my appointments data')
        mockMatchingURLResponse(/subjects/, 'my subjects data')

        expect(await SDK.appointments()).toMatchSnapshot()
        expect(await SDK.subjects()).toMatchSnapshot()
      })
    })

    describe('matchRequest', () => {
      it('should be possible to get the request object', async () => {
        expect(await matchRequest(SDK.appointments())).toMatchSnapshot()
      })

      it('should be possible to match multiple requests in one go', async () => {
        expect(await matchRequest(SDK.appointments())).toMatchSnapshot()
        expect(await matchRequest(SDK.appointments())).toMatchSnapshot()
      })
    })

    describe('mostRecentRequest', () => {
      it('should return the latest request', async () => {
        mockMatchingURLResponse(/appointments/, [{ id: 'appointment id 1' }])

        await SDK.appointments()
          .new({ value: 'x' })
          .then((appointment) => appointment.create())

        expect(mostRecentRequest()).toMatchSnapshot()
      })

      it('should return the latest request with multiple SDKs', async () => {
        mockMatchingURLResponse(/appointments/, [])
        mockMatchingURLResponse(/employees/, [])

        const secondSDK = new API({
          auth_provider,
          locale: 'nl-BE',
        })

        await SDK.appointments()
        expect(mostRecentRequest()).toMatchSnapshot()

        installSkedifySDKMock(secondSDK)
        mockMatchingURLResponse(/subjects/, [])
        await secondSDK.subjects()
        expect(mostRecentRequest()).toMatchSnapshot()
        uninstallSkedifySDKMock(secondSDK)

        await SDK.employees()
        expect(mostRecentRequest()).toMatchSnapshot()
      })
    })

    describe('mockedRequests', () => {
      it('should not include setup requests (access tokens & proxy)', async () => {
        const SDK2 = new API({
          auth_provider,
          locale: 'nl-BE',
        })

        installSkedifySDKMock(SDK2)

        mockMatchingURLResponse(/appointments/, [])
        mockMatchingURLResponse(/subjects/, [])
        mockMatchingURLResponse(/employees/, [])

        await SDK2.appointments()
        await SDK2.subjects()
        await SDK2.employees()

        expect(mockedRequests()).toMatchSnapshot()

        uninstallSkedifySDKMock(SDK2)
      })

      it('should not include setup requests (access tokens & proxy) but after setup they should be included', async () => {
        const SDK2 = new API({
          auth_provider,
          locale: 'nl-BE',
        })

        installSkedifySDKMock(SDK2)

        mockMatchingURLResponse(/appointments/, [])
        mockMatchingURLResponse(/subjects/, [])
        mockMatchingURLResponse(/employees/, [])
        mockMatchingURLResponse(
          /access_tokens/,
          'But this one should be included!'
        )

        await SDK2.appointments()
        await SDK2.subjects()
        await SDK2.employees()
        await SDK2.accessTokens()

        expect(mockedRequests()).toMatchSnapshot()

        // Mocked requests should have been reset
        expect(mockedRequests()).toHaveLength(0)

        // Access token & proxy should be included again
        mockMatchingURLResponse(/access_tokens\/self/)
        mockMatchingURLResponse(/integrations\/proxy/)
        await SDK2.accessTokens('self')
        await SDK2.integrations('proxy')
        expect(mockedRequests()).toHaveLength(2)

        uninstallSkedifySDKMock(SDK2)
      })

      it('should list all the requests', async () => {
        mockMatchingURLResponse(/appointments/, [])
        mockMatchingURLResponse(/subjects/, [])
        mockMatchingURLResponse(/employees/, [])

        await SDK.appointments()
        await SDK.subjects()
        await SDK.employees()

        expect(mockedRequests()).toMatchSnapshot()
      })
    })
  })
})
