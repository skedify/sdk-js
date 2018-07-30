import { set, get } from '../../secret'
import {
  validateIncludes,
  validateFilterCallback,
  validateFilterCallbackExecution,
  validateAddResponseInterceptorCallback,
} from './invariants'
import {
  HTTP_VERB_PATCH,
  HTTP_VERB_POST,
  HTTP_VERB_DELETE,
} from '../../constants'
import normalizeResponse from './normalizeResponse'
import createRequest from './createRequest'
import executeResponseInterceptors from './executeResponseInterceptors'
import clone from './clone'

function overrideThen(resource, replaceWith) {
  const originalThen = resource.then.bind(resource)

  resource.then = resolve => resolve(replaceWith(originalThen))

  return resource
}

export default class Resource {
  constructor(instance, descriptor, parent) {
    /**
     * Store private information
     */
    set(this, {
      // A list of interceptors when the response comes back,
      // each item will be called with the response
      responseInterceptors: [],

      // A request config used to build the actual network request
      requestConfig: {
        method: descriptor.method,
        data: undefined,
        include: [],
        filters: {},
        headers: {},
      },

      // The SDK instance
      instance,

      // The description for the current resource (filters, includes, ...)
      descriptor,

      // The parent resource
      parent,
    })
  }

  include(...includes) {
    set(this, ({ requestConfig }) => ({
      requestConfig: Object.assign({}, requestConfig, {
        include: [...requestConfig.include, ...includes].map(String),
      }),
    }))

    validateIncludes(this)

    return this
  }

  filter(callback) {
    validateFilterCallback({ callback })

    const { descriptor, requestConfig } = get(this)

    /**
     * Create an object with each "filterable" value as a function
     */
    const filterable = descriptor.filters.reduce(
      (item, filter) =>
        Object.assign(item, {
          [filter]: params => {
            Object.assign(requestConfig, {
              filters: Object.assign({}, requestConfig.filters, {
                [filter]: Array.isArray(requestConfig.filters[filter])
                  ? [...requestConfig.filters[filter], ...params]
                  : params !== undefined
                    ? params
                    : true, // Convert undefined to true
              }),
            })

            return filterable
          },
        }),
      {}
    )

    validateFilterCallbackExecution(this, () => {
      callback(filterable)
    })

    return this
  }

  addResponseInterceptor(callback) {
    validateAddResponseInterceptorCallback({ callback })

    set(this, ({ responseInterceptors }) => ({
      responseInterceptors: [...responseInterceptors, callback],
    }))

    return this
  }

  new(data) {
    // Clone the current Resource
    const cloned = overrideThen(clone(this), originalThen => ({
      create() {
        return new Promise(originalThen)
      },
    }))

    // Override request config
    set(cloned, ({ requestConfig }) => ({
      requestConfig: Object.assign({}, requestConfig, {
        data,
        method: HTTP_VERB_POST,
        name: 'new',
      }),
    }))

    return cloned
  }

  update(data) {
    // Clone the current Resource
    const cloned = overrideThen(clone(this), originalThen => ({
      save() {
        return new Promise(originalThen)
      },
    }))

    // Override request config
    set(cloned, ({ requestConfig }) => ({
      requestConfig: Object.assign({}, requestConfig, {
        data,
        method: HTTP_VERB_PATCH,
        name: 'patch',
      }),
    }))

    return cloned
  }

  delete() {
    // Clone the current Resource
    const cloned = overrideThen(clone(this), originalThen => ({
      delete() {
        return new Promise(originalThen)
      },
    }))

    // Override request config
    set(cloned, ({ requestConfig }) => ({
      requestConfig: Object.assign({}, requestConfig, {
        method: HTTP_VERB_DELETE,
        name: 'delete',
      }),
    }))

    return cloned
  }

  then(onFulfilled, onRejected) {
    const { instance } = get(this)
    const { identityProvider } = get(instance)

    return identityProvider
      .getAuthorization()
      .then(createRequest.bind(this, this))
      .then(normalizeResponse, normalizeResponse)
      .then(executeResponseInterceptors.bind(this, this))
      .then(onFulfilled, onRejected)
  }

  catch(onRejected) {
    return this.then(undefined, onRejected)
  }
}
