/* eslint-disable max-nested-callbacks */
import moxios from 'moxios'

import network from './util/network'

import Skedify from './Skedify'
import { mockResponse, matchRequest } from '../test/testUtils'

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

  it('should invoke a call when .then is called', () => {
    mockResponse([
      { id: 1, firstName: 'Fred', lastName: 'Flintstone' },
      { id: 2, firstName: 'Wilma', lastName: 'Flintstone' },
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
      { id: 1, firstName: 'Fred', lastName: 'Flintstone' },
      { id: 2, firstName: 'Wilma', lastName: 'Flintstone' },
    ])

    const mock = jest.fn()

    expect.assertions(1)

    return SDK.subjects()
      .catch(mock)
      .then(() => {
        expect(mock).not.toHaveBeenCalled()
      })
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

  describe('API/Resources/Subjects', () => {
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
          SDK.subjects().include('questions', 'subject_category')
        )
      ).toMatchSnapshot()
    })

    it('should be possible to make subsequent calls to include to add multiple includes', async () => {
      expect(
        await matchRequest(
          SDK.subjects()
            .include('questions')
            .include('subject_category')
        )
      ).toMatchSnapshot()
    })

    it('should make all the includes unique', async () => {
      expect(
        await matchRequest(
          SDK.subjects()
            .include('questions', 'questions')
            .include('subject_category', 'questions')
        )
      ).toMatchSnapshot()
    })

    it('should be possible to add includes to the a single subject', async () => {
      expect(
        await matchRequest(
          SDK.subjects(1).include('questions', 'subject_category')
        )
      ).toMatchSnapshot()
    })

    it('should throw an error when including a value that is not defined on the resource', () => {
      expect(() =>
        SDK.subjects(1).include('invalid')
      ).toThrowErrorMatchingSnapshot()
    })

    it('should be possible to use subresources', async () => {
      expect(await matchRequest(SDK.subjects(1).questions())).toMatchSnapshot()
    })

    it('should be possible to use subresources with its id', async () => {
      expect(await matchRequest(SDK.subjects(1).questions(2))).toMatchSnapshot()
    })

    it('should be possible to use subresources with its id and includes', async () => {
      expect(
        await matchRequest(
          SDK.subjects(1)
            .questions(2)
            .include('options')
        )
      ).toMatchSnapshot()
    })

    it('should throw when a subresource is used but no id is provided', () => {
      expect(() => SDK.subjects().questions()).toThrowErrorMatchingSnapshot()
    })

    it('should throw when a subresource with id is used but no parent id is provided', () => {
      expect(() => SDK.subjects().questions(123)).toThrowErrorMatchingSnapshot()
    })

    it('should throw when include is used before the subresource is used', () => {
      expect(() =>
        SDK.subjects(1)
          .include('subject_category')
          .questions()
      ).toThrowErrorMatchingSnapshot()

      expect(() =>
        SDK.subjects(1)
          .include('subject_category')
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
        await matchRequest(SDK.customers('external://abc123'))
      ).toMatchSnapshot()
    })
  })
})
