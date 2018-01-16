/* eslint-disable max-nested-callbacks */
import moxios from 'moxios'
import axios from 'axios'

import Client from './Client'

describe('Identity Provider # Client', () => {
  let network
  beforeEach(() => {
    network = axios.create()
    moxios.install(network)
  })

  afterEach(() => {
    moxios.uninstall(network)
  })

  it('should be able to create an identity provider instance', () => {
    const client = new Client(network, {
      client_id: 'client 123',
      realm: 'https://example.com',
    })

    expect(client).toBeDefined()
  })

  it('should error when no options are given', () => {
    expect(() => new Client(network)).toThrowErrorMatchingSnapshot()
  })

  it('should error when client_id is not given', () => {
    expect(
      () =>
        new Client(network, {
          realm: 'https://example.com',
        })
    ).toThrowErrorMatchingSnapshot()
  })

  it('should error when realm is not given', () => {
    expect(
      () =>
        new Client(network, {
          client_id: 'client 123',
        })
    ).toThrowErrorMatchingSnapshot()
  })

  it('should be possible to authenticate', async () => {
    const client = new Client(network, {
      client_id: 'client 123',
      realm: 'https://example.com',
    })

    // Mock the authentication request
    moxios.wait(() => {
      moxios.requests.mostRecent().respondWith({
        status: 200,
        response: {
          access_token: 'rMOUIcH85oh44KD7RM4XRk7jFPiG8RMLi2IPqFsQ',
          token_type: 'Bearer',
          expires_in: 5400,
        },
      })

      // Mock the proxy call
      moxios.wait(() => {
        moxios.requests.mostRecent().respondWith({
          status: 200,
          response: {
            data: {
              url: 'https://api.example.com',
            },
          },
        })
      }, 0)
    }, 0)

    // Wait for our call
    await client.getAuthorization()

    const {
      data,
      headers,
      method,
      params,
      url,
    } = moxios.requests.mostRecent().config

    expect({ data, headers, method, params, url }).toMatchSnapshot()

    // A call to auth + proxy should have been made
    expect(moxios.requests.count()).toBe(2)
  })

  it('should be possible to re-use the same auth request', async () => {
    const client = new Client(network, {
      client_id: 'client 123',
      realm: 'https://example.com',
    })

    // Mock the authentication request
    moxios.wait(() => {
      moxios.requests.mostRecent().respondWith({
        status: 200,
        response: {
          access_token: 'rMOUIcH85oh44KD7RM4XRk7jFPiG8RMLi2IPqFsQ',
          token_type: 'Bearer',
          expires_in: 5400,
        },
      })

      // Mock the proxy call
      moxios.wait(() => {
        moxios.requests.mostRecent().respondWith({
          status: 200,
          response: {
            data: {
              url: 'https://api.example.com',
            },
          },
        })
      }, 0)
    }, 0)

    // Wait for our call
    await client.getAuthorization()
    await client.getAuthorization()
    await client.getAuthorization()

    // Only the first auth + proxy call should have been made
    expect(moxios.requests.count()).toBe(2)
  })
})
