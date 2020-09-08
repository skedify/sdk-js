import settle from 'axios/lib/core/settle'
import isFunction from '../src/util/isFunction'

const instances = []

function storage() {
  return instances[instances.length - 1]
}

function mapRequestConfig(config) {
  const { data, headers, method, params, url } = config

  return {
    data: data && JSON.parse(data),
    headers,
    method,
    params,
    url,
  }
}

function mockAdapter(config) {
  return new Promise((resolve, reject) => {
    const request = mapRequestConfig(config)

    const { requests, responses } = storage()
    requests.push(request)

    const responseIndex = responses.findIndex((response) =>
      response.url instanceof RegExp
        ? response.url.test(request.url)
        : response.url === request.url
    )

    if (responseIndex !== -1) {
      const [{ response, options }] = responses.splice(responseIndex, 1)
      const { onRespond } = options.hooks

      onRespond(request, response)

      return settle(resolve, reject, {
        config,
        request,
        status: response.status,
        data: response.data,
      })
    }

    return reject(
      new Error(
        'There is no response, did you forget to call `mockResponse`? For more info please go to: https://github.com/skedify/sdk-js#testing'
      )
    )
  })
}

const defaultAdapters = new WeakMap()

function createResponse(url, data, status, options) {
  return { url, response: { status, data }, options }
}

export function mockMatchingURLResponse(urlOrRegExp, response, status = 200) {
  const options = { hooks: { onRespond: () => undefined } }

  storage().responses.push(
    createResponse(urlOrRegExp, response, status, options)
  )

  return {
    onRespond(cb) {
      if (isFunction(cb)) {
        options.hooks.onRespond = cb
      }
    },
  }
}

export function mockResponse(response, status = 200) {
  return mockMatchingURLResponse(/.*/, response, status)
}

export function mostRecentRequest() {
  const { requests } = storage()
  return requests[requests.length - 1]
}

const ACCESS_TOKEN_CALL = {
  url: /access_tokens/,
  response: {
    status: 200,
    data: {
      access_token: 'fake_example_access_token',
      token_type: 'Bearer',
      expires_in: 5400,
    },
  },
}

const PROXY_CALL = {
  url: /\/integrations\/proxy/,
  response: {
    status: 200,
    data: {
      data: {
        // We need to use a getter to delay the execution of this function
        // We need access to the mostRecent request, but if there is no most recent
        // Request we can't access its url. Therefor once we are sure the /integrations/proxy
        // Is executed, we can safely run the mostRecent() function.
        get url() {
          return mostRecentRequest().url.replace('/integrations/proxy', '')
        },
      },
    },
  },
}

const SETUP_REQUESTS = [{ ...ACCESS_TOKEN_CALL }, { ...PROXY_CALL }]

export function mockedRequests() {
  const { requests, ignoredRequests } = storage()

  return requests
    .splice(0)
    .filter((request) => !ignoredRequests.includes(request))
}

export function install(instance, options = {}) {
  const { mockAccessTokensCall } = Object.assign(
    {
      mockAccessTokensCall: true,
    },
    options
  )

  defaultAdapters.set(instance, instance.defaults.adapter)
  instance.defaults.adapter = mockAdapter

  // Let's start clean
  instances.push({
    requests: [],
    responses: [],
    ignoredRequests: [],
  })

  const setup_calls = mockAccessTokensCall ? SETUP_REQUESTS : [PROXY_CALL]

  // Stub setup requests
  setup_calls.forEach(({ url, response }) => {
    mockMatchingURLResponse(
      url,
      response.data,
      response.status
    ).onRespond((request) => storage().ignoredRequests.push(request))
  })
}

export function uninstall(instance) {
  instance.defaults.adapter = defaultAdapters.get(instance)

  // Let's do some cleanup
  instances.pop()
}
