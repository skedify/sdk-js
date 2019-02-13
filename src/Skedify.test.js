/* eslint-disable max-nested-callbacks, max-statements */
import {
  API,
  installSkedifySDKMock,
  uninstallSkedifySDKMock,
  mockResponse,
  matchRequest,
  mockMatchingURLResponse,
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
    Object.keys(exported).forEach(key => {
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

    uninstallSkedifySDKMock(SDK)
    installSkedifySDKMock(SDK)

    mockResponse('my subjects data')
    expect(await SDK.subjects()).toMatchSnapshot()
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

    uninstallSkedifySDKMock(SDK)
    installSkedifySDKMock(SDK)

    mockResponse('my subjects data')
    expect(await SDK.subjects()).toMatchSnapshot()
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

    valids.forEach(locale => {
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

    invalids.forEach(locale => {
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
})

describe('API', () => {
  let SDK

  beforeAll(() => {
    SDK = new API({
      auth_provider,
      locale: 'nl-BE',
    })
  })

  beforeEach(() => {
    uninstallSkedifySDKMock(SDK)
    installSkedifySDKMock(SDK)
  })

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

  describe('API/Response', () => {
    it('should normalize the response when the call succeeds', async () => {
      mockResponse([])
      expect(await SDK.identity()).toMatchSnapshot()
    })

    it('should normalize the response when the call fails', async () => {
      const data = []
      const meta = []
      const warnings = []

      mockResponse(data, meta, warnings, 422)

      expect.assertions(1)

      try {
        await SDK.appointments()
          .new({})
          .then(appointment => appointment.create())
      } catch (err) {
        expect(err).toMatchSnapshot()
      }
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
          SDK.subjects(1)
            .questions(2)
            .include(SDK.include.options)
        )
      ).toMatchSnapshot()
    })

    it('should be possible to disable certain actions (update) on a resource', () => {
      expect(() =>
        SDK.insights('cumulio')
          .auth()
          .update({
            id: 'new id',
          })
      ).toThrowErrorMatchingSnapshot()
    })

    it('should be possible to disable certain actions (delete) on a resource', () => {
      expect(() =>
        SDK.insights('cumulio')
          .auth()
          .delete()
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
        SDK.subjects(1)
          .include(SDK.include.subject_category)
          .questions()
      ).toThrowErrorMatchingSnapshot()

      expect(() =>
        SDK.subjects(1)
          .include(SDK.include.subject_category)
          .questions(123)
      ).toThrowErrorMatchingSnapshot()
    })

    it('should be possible to add filters to a resource', async () => {
      expect(
        await matchRequest(
          SDK.subjects(1).filter(item =>
            item.schedulable_with_contact(['1', '2'])
          )
        )
      ).toMatchSnapshot()
    })

    it('should be possible to add filters to a resource that has special filter syntax', async () => {
      expect(
        await matchRequest(
          SDK.integrations().filter(item => item.type('cumulio'))
        )
      ).toMatchSnapshot()
    })

    it('should filter out undefined values when using filters', async () => {
      expect(
        await matchRequest(
          SDK.subjects(1).filter(item =>
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
        SDK.subjects(1).filter(item => item.nonExistingMethod())
      ).toThrowErrorMatchingSnapshot()
    })

    it('should throw an error when calling a non existing filter function and one of the defined filters is using an object alias', () => {
      expect(() =>
        SDK.integrations().filter(item => item.nonExistingMethod())
      ).toThrowErrorMatchingSnapshot()
    })

    it('should throw a slightly different error when calling a non existing filter function when there are no possible filters for this resource', () => {
      expect(() =>
        SDK.users().filter(item => item.nonExistingMethod())
      ).toThrowErrorMatchingSnapshot()
    })

    it('should default to true when a filter is given with no value', async () => {
      expect(
        await matchRequest(SDK.subjects(1).filter(item => item.schedulable()))
      ).toMatchSnapshot()
    })

    it('should be possible to merge filters with the same name', async () => {
      expect(
        await matchRequest(
          SDK.subjects(1).filter(item =>
            item
              .schedulable_with_contact(['1', '2'])
              .schedulable_with_contact(['2', '3'])
          )
        )
      ).toMatchSnapshot()
    })

    it('should be possible to create a more advanced combination of calls (timetable)', async () => {
      expect(
        await matchRequest(
          SDK.subjects(316)
            .timetable()
            .filter(item =>
              item
                .office(1308)
                .start('2017-12-21')
                .end('2017-12-26')
            )
        )
      ).toMatchSnapshot()
    })

    it('should be possible to use shorthands (timetable)', async () => {
      expect(
        await matchRequest(
          SDK.timetable({
            subject: 316,
            office: 1308,
            start: '2017-12-21',
            end: '2017-12-26',
          })
        )
      ).toMatchSnapshot()
    })

    it('should be possible to use shorthands (timetable) with optional values like contacts', async () => {
      expect(
        await matchRequest(
          SDK.timetable({
            subject: 316,
            office: 1308,
            start: '2017-12-21',
            end: '2017-12-26',
            contacts: [1, 2, 3],
          })
        )
      ).toMatchSnapshot()
    })

    it('should throw an error when required props are missing from a shorthand call (timetable)', () => {
      expect(() =>
        SDK.timetable({
          subject: 316,
          end: '2017-12-26',
        })
      ).toThrowErrorMatchingSnapshot()
    })

    it('should throw an error when no values are passed for the timetable shorthand', () => {
      expect(() => SDK.timetable()).toThrowErrorMatchingSnapshot()
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

      return SDK.customers('external://abc123').catch(error => {
        expect(error).toMatchSnapshot()
        expect(error.response.data).toMatchSnapshot()
        expect(error.response.data).toBe(error.alternatives)
      })
    })

    it('should throw an error when an external://abc123 call returns no records', () => {
      mockResponse([])

      expect.assertions(2)

      return SDK.customers('external://abc123').catch(error => {
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
            .then(appointment => appointment.create())
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
            .then(appointment => appointment.create())
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
            .then(appointment => appointment.create())
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
            .then(appointment => appointment.save())
        )
      ).toMatchSnapshot()
    })

    it('should be possible to delete an entity', async () => {
      expect(
        await matchRequest(
          SDK.appointments(1207)
            .delete()
            .then(appointment => appointment.delete())
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
            .then(appointment => appointment.save())
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
          .then(appointment => appointment.save())
      )
      const readRequest = await matchRequest(base)

      expect(patchRequest).toMatchSnapshot()
      expect(readRequest).toMatchSnapshot()
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
  })
})
