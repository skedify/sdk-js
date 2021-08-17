import { set, get } from '../../secret'
import {
  validateIncludes,
  validateFilterCallback,
  validateFilterCallbackExecution,
  validateAddResponseInterceptorCallback,
  validateDeprecations,
  validatePagingArguments,
} from './invariants'
import {
  HTTP_VERB_PATCH,
  HTTP_VERB_PUT,
  HTTP_VERB_POST,
  HTTP_VERB_DELETE,
  HTTP_VERB_ALL_WILDCARD,
} from '../../constants'
import normalizeResponse from './normalizeResponse'
import createRequest from './createRequest'
import executeResponseInterceptors from './executeResponseInterceptors'
import clone from './clone'
import { createConfigError } from '../../util/createError'
import isObject from '../../util/isObject'
import createAcceptLanguageHeader from '../withDefaults/createAcceptLanguageHeader'
import { validateLocale } from '../withConfig/validate'
import addPagingResponse from './addPagingResponse'

function overrideThen(resource, replaceWith) {
  const originalThen = resource.then.bind(resource)

  resource.then = (resolve) => resolve(replaceWith(originalThen))

  return resource
}

function isAllowed(instance, method) {
  return [HTTP_VERB_ALL_WILDCARD]
    .concat(method)
    .some((check) => get(instance).descriptor.allowed_methods.includes(check))
}

function createResourcePath(resource) {
  if (resource === undefined) {
    return []
  }

  const { parent, descriptor } = get(resource)

  return [...createResourcePath(parent), descriptor.resource]
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

      // The paging metadata
      paging: {},
    })

    // A path to this resource, e.g.: users.calendars.events
    const resource_path = createResourcePath(this).join('.')
    get(this).resource_path = resource_path

    if (descriptor.requires_domain_map) {
      if (get(instance).resource_domain_map[resource_path] === undefined) {
        throw new Error(
          `The resource "${resource_path}" requires a custom resource domain map because this is likely to be a private service that needs a custom domain.`
        )
      }
    }
  }

  locale(locale) {
    validateLocale(locale)

    set(this, ({ requestConfig }) => ({
      requestConfig: Object.assign({}, requestConfig, {
        headers: Object.assign({}, requestConfig.headers, {
          'Accept-Language': createAcceptLanguageHeader(locale),
        }),
      }),
    }))

    return this
  }

  headers(requested_headers) {
    set(this, ({ requestConfig }) => ({
      requestConfig: Object.assign({}, requestConfig, {
        headers: Object.assign({}, requestConfig.headers, requested_headers),
      }),
    }))

    return this
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
    const filterable = descriptor.filters.reduce((item, filter) => {
      const { key, name } = isObject(filter)
        ? filter
        : { key: filter, name: filter }

      return Object.assign(item, {
        [name]: (params) => {
          Object.assign(requestConfig, {
            filters: Object.assign({}, requestConfig.filters, {
              [key]: Array.isArray(requestConfig.filters[key])
                ? [...requestConfig.filters[key], ...params]
                : params !== undefined
                ? params
                : true, // Convert undefined to true
            }),
          })

          return filterable
        },
      })
    }, {})

    validateFilterCallbackExecution(this, () => {
      callback(filterable)
    })

    return this
  }

  limit(limit) {
    const { paging } = get(this)

    set(this, {
      paging: {
        ...paging,
        per_page: limit,
      },
    })

    return this
  }

  page(page) {
    const { paging } = get(this)

    set(this, {
      paging: {
        ...paging,
        page,
      },
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
    if (!isAllowed(this, HTTP_VERB_POST)) {
      throw createConfigError(
        `You tried to call \`.new(${JSON.stringify(
          data
        )})\` but this method is currently not allowed.`
      )
    }

    // Clone the current Resource
    const cloned = overrideThen(clone(this), (originalThen) => ({
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
    if (!isAllowed(this, HTTP_VERB_PATCH)) {
      throw createConfigError(
        `You tried to call \`.update(${JSON.stringify(
          data
        )})\` but this method is currently not allowed.`
      )
    }

    // Clone the current Resource
    const cloned = overrideThen(clone(this), (originalThen) => ({
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

  replace(data) {
    if (!isAllowed(this, HTTP_VERB_PUT)) {
      throw createConfigError(
        `You tried to call \`.replace(${JSON.stringify(
          data
        )})\` but this method is currently not allowed.`
      )
    }

    // Clone the current Resource
    const cloned = overrideThen(clone(this), (originalThen) => ({
      save() {
        return new Promise(originalThen)
      },
    }))

    // Override request config
    set(cloned, ({ requestConfig }) => ({
      requestConfig: Object.assign({}, requestConfig, {
        data,
        method: HTTP_VERB_PUT,
        name: 'put',
      }),
    }))

    return cloned
  }

  delete() {
    if (!isAllowed(this, HTTP_VERB_DELETE)) {
      throw createConfigError(
        `You tried to call \`.delete()\` but this method is currently not allowed.`
      )
    }

    // Clone the current Resource
    const cloned = overrideThen(clone(this), (originalThen) => ({
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
    const { instance, existing_call = null } = get(this)
    const { identityProvider } = get(instance)

    // Call is already in progress
    if (existing_call !== null) {
      return existing_call.then(onFulfilled, onRejected)
    }

    validateDeprecations(this)

    validatePagingArguments(this)

    get(this).existing_call = new Promise((resolve, reject) => {
      identityProvider
        .getAuthorization()
        .then(createRequest.bind(this, this))
        .then(normalizeResponse, normalizeResponse)
        .then(addPagingResponse)
        .then(executeResponseInterceptors.bind(this, this))
        .then(resolve, reject)
    })

    return get(this).existing_call.then(onFulfilled, (...args) => {
      if (instance.configuration.onError) {
        instance.configuration.onError(...args)
      }

      return onRejected && onRejected(...args)
    })
  }

  catch(onRejected) {
    return this.then(undefined, onRejected)
  }
}
