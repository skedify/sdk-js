import triggerCallbacks from './triggerCallbacks'
import setImmediate from './setImmediate'
import {
  EVENT_ABORT,
  EVENT_ERROR,
  EVENT_LOAD,
  EVENT_PROGRESS,
  EVENT_TIMEOUT,
} from './Factory'

export default function XDomainFactory(options) {
  if (options.method !== 'GET' && options.method !== 'POST') {
    throw new TypeError('old IE only supports GET and POST')
  }

  const request = new XDomainRequest()

  request.timeout = 30000

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

  request.onprogress = function onprogress() {
    triggerCallbacks(handlers[EVENT_PROGRESS], {
      lengthComputable: false,
      loaded: request.responseText.length,
      total: undefined,
    })
  }

  request.ontimeout = function ontimeout(e) {
    const err = e || new TypeError('Network request timed out')
    // Timeout

    triggerCallbacks(handlers[EVENT_TIMEOUT], err)
  }

  request.onerror = function onerror(e) {
    const err = e || new TypeError('Network request failed')
    // Error Occured

    triggerCallbacks(handlers[EVENT_ERROR], err)
  }

  request.onload = function onload(_e) {
    try {
      const response = JSON.parse(request.responseText)

      triggerCallbacks(handlers[EVENT_LOAD], {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
        url: options.url,
        body: response,
      })
    } catch (ex) {
      triggerCallbacks(handlers[EVENT_ERROR], new Error("Response wasn't JSON"))
    }
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
