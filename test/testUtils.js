import moxios from 'moxios'

const WAIT_TIME = 0

export function mockResponse(data, meta, warnings, status = 200) {
  // Mock the authentication request
  moxios.stubRequest(/access_tokens/, {
    status: 200,
    response: {
      access_token: 'fake_example_access_token',
      token_type: 'Bearer',
      expires_in: 5400,
    },
  })

  // Mock the proxy call
  moxios.stubRequest(/\/integrations\/proxy/, {
    status: 200,
    response: {
      data: {
        // We need to use a getter to delay the execution of this function
        // We need access to the mostRecent request, but if there is no most recent
        // Request we can't access its url. Therefor once we are sure the /integrations/proxy
        // Is executed, we can safely run the mostRecent() function.
        get url() {
          return moxios.requests
            .mostRecent()
            .url.replace('/integrations/proxy', '')
        },
      },
    },
  })

  // Mock the actual request
  moxios.wait(() => {
    moxios.requests.mostRecent().respondWith({
      status,
      response: { data, meta, warnings },
    })
  }, WAIT_TIME)
}

export function matchRequest(
  promise,
  fakeData,
  fakeMeta,
  fakeWarnings,
  fakeStatus
) {
  mockResponse(fakeData, fakeMeta, fakeWarnings, fakeStatus)

  return promise.then(() => {
    const {
      data,
      headers,
      method,
      params,
      url,
    } = moxios.requests.mostRecent().config

    return {
      data: data && JSON.parse(data),
      headers,
      method,
      params,
      url,
    }
  })
}
