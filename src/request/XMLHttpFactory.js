import triggerCallbacks from './triggerCallbacks'
import setImmediate from './setImmediate'
import {
  EVENT_ABORT,
  EVENT_ERROR,
  EVENT_LOAD,
  EVENT_PROGRESS,
  EVENT_TIMEOUT,
} from './Factory'

export default function XMLHttpFactory(options) {
  const request = new XMLHttpRequest()

  const handlers = {
    [EVENT_ABORT]: [],
    [EVENT_ERROR]: [],
    [EVENT_LOAD]: [],
    [EVENT_PROGRESS]: [],
    [EVENT_TIMEOUT]: [],
  }

  const { body } = options

  let sending = false

  request.open(options.method, options.url)
  request.timeout = 30000

  if ('responseType' in request) {
    request.responseType = 'json'
  }

  Object.keys(options.headers).forEach(header => {
    request.setRequestHeader(header, options.headers[header])
  })

  request.onprogress = function onprogress(e) {
    triggerCallbacks(handlers[EVENT_PROGRESS], {
      lengthComputable: e.lengthComputable,
      loaded: e.loaded,
      total: e.total,
    })
  }

  request.ontimeout = function ontimeout(e) {
    const err = e || new TypeError('Network request timed out')

    triggerCallbacks(handlers[EVENT_TIMEOUT], err)
  }

  request.onerror = function onerror(e) {
    const err = e || new TypeError('Network request failed')

    triggerCallbacks(handlers[EVENT_ERROR], err)
  }

  request.onload = function onload() {
    const headers = (request.getAllResponseHeaders() || '')
      .trim()
      .split('\n')
      .reduce((accumulator, header) => {
        const split = header.trim().split(':')
        const key = split
          .shift()
          .trim()
          .toLowerCase()
        const value = split.join(':').trim()

        accumulator[key] = value
        return accumulator
      }, {})

    triggerCallbacks(handlers[EVENT_LOAD], {
      status: request.status,
      statusText: request.statusText,
      headers: headers,
      url: (function responseURL() {
        if ('responseURL' in request) {
          return request.responseURL
        }

        // Avoid security warnings on getResponseHeader when not allowed by CORS
        if (headers['x-request-url'] !== undefined) {
          return headers['x-request-url']
        }

        return options.url
      })(),
      body:
        'response' in request && request.responseType === 'json'
          ? request.response
          : JSON.parse(request.responseText),
    })
  }

  return {
    addEventListener: function addEventListener(type, callback) {
      const queue = handlers[type]

      if (queue !== undefined) {
        queue.push(callback)
        return true
      }
      return false
    },
    removeEventListener: function removeEventListener(type, callback) {
      const queue = handlers[type]

      if (queue !== undefined) {
        const idx = queue.indexOf(callback)

        if (idx !== -1) {
          queue.splice(idx, 1)
          return true
        }
      }
      return false
    },
    send: function send() {
      sending = true
      setImmediate(() => {
        try {
          request.send(body)
        } catch (ex) {
          triggerCallbacks(handlers[EVENT_ERROR], ex)
        }
      })
    },
    abort: function abort() {
      if (sending) {
        request.abort()
        setImmediate(function onAbort() {
          triggerCallbacks(handlers[EVENT_ABORT])
        })
      } else {
        throw new Error('Cannot abort request that is not being sent.')
      }
    },
  }
}
