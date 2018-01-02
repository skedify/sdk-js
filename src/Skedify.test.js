/* eslint-disable max-nested-callbacks */
import moxios from 'moxios'

import network from './util/network'

import Skedify from './Skedify'
import { mockResponse, matchRequest } from '../test/testUtils'

import * as exported from './constants/exported'

/**
 * We need to make sure that the public API works correctly
 * The tests in this file will only interact with the public API itself
 */
describe('API/Utils', () => {
  it('should expose a util to create an auth_provider object', () => {
    expect(
      Skedify.API.createAuthProviderString('client', {
        Foo: 'Foo',
        Bar: 'Bar',
        Baz: 'http://foo.bar.baz/',
      })
    ).toEqual('client://Foo=Foo&Bar=Bar&Baz=http%3A%2F%2Ffoo.bar.baz%2F')
  })

  it('should expose all error types and subtypes on the Skedify.API object', () => {
    Object.keys(exported).forEach(key => {
      expect(Skedify.API).toHaveProperty(key)
      expect(Skedify.API[key]).toBe(exported[key])
    })
  })
})

const auth_provider = Skedify.API.createAuthProviderString('client', {
  client_id: 'someclientidtokengoeshere',
  realm: 'https://api.example.com',
})

describe('API/Config', () => {
  // Test setup process
  it('should throw an error when no config is given', () => {
    expect(() => new Skedify.API()).toThrow()
  })

  it('should throw an error when the mandatory config items are not present', () => {
    expect(() => new Skedify.API({ locale: 'nl-BE' })).toThrow()
    expect(() => new Skedify.API({ auth_provider })).toThrow()
  })

  it('should throw an error when the locale is wrongly formatted', () => {
    const invalids = [
      'NL', // Because it needs to be lowercase.
      'nl-be', // Because the "be" needs to be uppercase.
      'nl-BE+VWV', // Because + is not allowed.
      'nl-BE-', // There can not be a lost dash on the end.
      'nl-BE-VWVX', // Because maximum 3 characters in the last place are allowed.
      'nl-BE-vwv', // The last branch should be uppercase as well.
    ]

    invalids.forEach(locale => {
      expect(() => new Skedify.API({ locale, auth_provider })).toThrowError(
        '[CONFIG]: locale is not valid.'
      )
    })
  })

  it('should be possible to read the config', () => {
    const config = {
      auth_provider,
      locale: 'nl-BE',
    }
    const SDK = new Skedify.API(config)

    expect(SDK.configuration).toEqual(config)
  })

  it('should be possible to merge new config items', () => {
    const SDK = new Skedify.API({
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
    const SDK = new Skedify.API({
      auth_provider,
      locale: 'nl-BE',
    })

    expect(() => {
      SDK.configure({ locale: undefined })
    }).toThrow()
  })

  it('should throw an error when overriding the whole config object', () => {
    const SDK = new Skedify.API({
      auth_provider,
      locale: 'nl-BE',
    })

    expect(() => {
      SDK.configuration = {}
    }).toThrowErrorMatchingSnapshot()
  })

  it('should throw an error when overriding items on the configuration object directly', () => {
    const SDK = new Skedify.API({
      auth_provider,
      locale: 'nl-BE',
    })

    expect(() => {
      SDK.configuration.locale = 'fr-BE'
    }).toThrowErrorMatchingSnapshot()
  })

  it('should be possible to listen for configuration changes', () => {
    const mock = jest.fn()

    const SDK = new Skedify.API({
      auth_provider,
      locale: 'nl-BE',
    })

    SDK.onConfigurationChange(mock)

    SDK.configure({ locale: 'fr-BE' })

    expect(mock).toHaveBeenCalled()
  })

  it('should throw an error when onConfigurationChange is not passed a function', () => {
    const SDK = new Skedify.API({
      auth_provider,
      locale: 'nl-BE',
    })

    expect(() => SDK.onConfigurationChange(null)).toThrowErrorMatchingSnapshot()
  })

  it('should be possible to "un"-listen for configuration changes', () => {
    const mock = jest.fn()

    const SDK = new Skedify.API({
      auth_provider,
      locale: 'nl-BE',
    })

    const unlisten = SDK.onConfigurationChange(mock)
    unlisten()

    SDK.configure({ locale: 'fr-BE' })

    expect(mock).not.toHaveBeenCalled()
  })
})

describe('API', () => {
  let SDK

  beforeAll(() => {
    SDK = new Skedify.API({
      auth_provider,
      locale: 'nl-BE',
    })
  })

  beforeEach(() => {
    moxios.install(network)
  })

  afterEach(() => {
    moxios.uninstall(network)
  })

  it('should expose all available includes on the Skedify.API instance', () => {
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

  it('should relfect configuration changes in the request (locale)', async () => {
    expect(await matchRequest(SDK.subjects())).toMatchSnapshot()

    const before = SDK.configuration

    SDK.configure({ locale: 'fr-BE' })

    expect(await matchRequest(SDK.subjects())).toMatchSnapshot()

    SDK.configure(before)
  })

  it('should relfect configuration changes in the request (auth_provider)', async () => {
    expect(await matchRequest(SDK.subjects())).toMatchSnapshot()

    const before = SDK.configuration

    SDK.configure({
      auth_provider: Skedify.API.createAuthProviderString('client', {
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

  it('should convert all the `id` and `XXX_id` keys to strings', () => {
    mockResponse([
      { id: 1, foo: 'foo' },
      {
        id: 2,
        bar: 'bar',
        deep: [{ office_id: 5 }],
      },
    ])

    expect.assertions(1)

    return SDK.subjects().then(({ data }) =>
      expect(data).toEqual([
        { id: '1', foo: 'foo' },
        {
          id: '2',
          bar: 'bar',
          deep: [{ office_id: '5' }],
        },
      ])
    )
  })

  describe('API/Resources', () => {
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
          SDK.appointments
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
  })
})
