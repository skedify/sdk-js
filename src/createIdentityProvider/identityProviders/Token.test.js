/* eslint-disable max-nested-callbacks */
import moxios from 'moxios'
import axios from 'axios'

import Token from './Token'

describe('Identity Provider # Token', () => {
  let network
  beforeEach(() => {
    network = axios.create()
    moxios.install(network)
  })

  afterEach(() => {
    moxios.uninstall(network)
  })

  it('should be able to create an identity provider instance', () => {
    const client = new Token(network, {
      token_type: 'Bearer',
      access_token: 'some-access-token-goes-here',
      realm: 'https://example.com',
    })

    expect(client).toBeDefined()
  })

  it('should error when no options are given', () => {
    expect(() => new Token(network)).toThrowErrorMatchingSnapshot()
  })

  it('should error when token_type is not given', () => {
    expect(
      () =>
        new Token(network, {
          access_token: 'some-access-token-goes-here',
          realm: 'https://example.com',
        })
    ).toThrowErrorMatchingSnapshot()
  })

  it('should error when access_token is not given', () => {
    expect(
      () =>
        new Token(network, {
          token_type: 'Bearer',
          realm: 'https://example.com',
        })
    ).toThrowErrorMatchingSnapshot()
  })

  it('should error when realm is not given', () => {
    expect(
      () =>
        new Token(network, {
          token_type: 'Bearer',
          access_token: 'some-access-token-goes-here',
        })
    ).toThrowErrorMatchingSnapshot()
  })

  it('should be possible to authenticate', async () => {
    const client = new Token(network, {
      token_type: 'Bearer',
      access_token: 'some-access-token-goes-here',
      realm: 'https://example.com',
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
    expect(moxios.requests.count()).toBe(1)
  })

  it('should be possible to re-use the same auth request', async () => {
    const client = new Token(network, {
      token_type: 'Bearer',
      access_token: 'some-access-token-goes-here',
      realm: 'https://example.com',
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

    // Wait for our call
    await client.getAuthorization()
    await client.getAuthorization()
    await client.getAuthorization()

    // Only the first auth + proxy call should have been made
    expect(moxios.requests.count()).toBe(1)
  })
})
