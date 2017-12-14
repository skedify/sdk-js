import RequestFactory, {
  EVENT_ABORT,
  EVENT_ERROR,
  EVENT_LOAD,
  EVENT_PROGRESS,
  EVENT_TIMEOUT,
} from './Factory'
import encode from '../encode'

const METHODS = ['GET', 'HEAD', 'POST', 'PATCH', 'PUT', 'DELETE']

export default function request(url, body, options) {
  const request_parameters = {
    method: (options.method || 'GET').toUpperCase(),
    url,
    headers: {
      Accept: 'application/json; q=1, charset=UTF-8',
      'X-Requested-With': `${PACKAGE}/${VERSION}`,
    },
  }

  if (METHODS.indexOf(request_parameters.method) === -1) {
    throw new TypeError('Invalid HTTP verb')
  }

  if (options.headers !== undefined) {
    Object.getOwnPropertyNames(options.headers).forEach(header => {
      request_parameters.headers[header] = options.headers[header]
    })
  }

  if (
    request_parameters.method === 'POST' ||
    request_parameters.method === 'PATCH'
  ) {
    request_parameters.headers['Content-Type'] =
      'application/json; q=1, charset=UTF-8'
    request_parameters.body = JSON.stringify(body)
  }

  if (
    request_parameters.query !== undefined &&
    Object.keys(request_parameters.query).length > 0
  ) {
    request_parameters.url = `${request_parameters.url}?${encode(
      request_parameters.query
    )}`
  }

  if (request_parameters.method === 'GET') {
    request_parameters.headers['If-Modified-Since'] =
      'Mon, 19 Aug 2013 09:00:00 CEST'
  }

  const instance = new RequestFactory(request_parameters)

  const my = new Promise((resolve, reject) => {
    instance.addEventListener(EVENT_ABORT, e => {
      reject(e)
    })
    instance.addEventListener(EVENT_ERROR, e => {
      reject(e)
    })
    instance.addEventListener(EVENT_LOAD, response => {
      if (response.status >= 200 && response.status < 300) {
        resolve(response)
      } else {
        reject(response)
      }
    })
    instance.addEventListener(EVENT_TIMEOUT, e => {
      reject(e)
    })

    instance.send()
  })

  Object.defineProperty(my, 'abort', {
    enumerable: false,
    writable: false,
    value() {
      instance.abort()
    },
  })

  Object.defineProperty(my, 'onprogress', {
    enumerable: false,
    set(callback) {
      instance.addEventListener(EVENT_PROGRESS, callback)
    },
  })

  return my
}
