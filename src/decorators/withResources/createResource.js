import { withResources } from '.'
import { applyDecorators } from '..'
import normalizeResponse from './normalizeResponse'

import omit from '../../util/omit'

const SHOULD_FORCE_AUTHORIZATION_REQUEST = IS_TEST

import createCallConfig from './createCallConfig'
import {
  validateFilterCallback,
  validateIncludes,
  validateFilterCallbackExecution,
  validateAddResponseInterceptorCallback,
} from './invariants'
import {
  HTTP_VERB_PATCH,
  ALL_HTTP_VERBS,
  HTTP_VERB_POST,
} from '../../constants'

function createURL(...parts) {
  return parts.filter(Boolean).join('/')
}

function createParentURL(parent) {
  if (parent === undefined) {
    return undefined
  }

  return createURL(
    createParentURL(parent.__meta.parent),
    parent.__meta.resource,
    parent.__meta.identifier && encodeURIComponent(parent.__meta.identifier)
  )
}

function overrideThen(promise, replaceWith) {
  const originalThen = promise.then

  promise.then = function then(resolve) {
    return resolve(replaceWith(originalThen))
  }

  return promise
}

export default function createResource(meta, resourceDescription, parent) {
  const { identityProvider, network } = meta

  /**
   * Setup a place to store all information for the current resource
   */
  const requestConfig = {
    method: resourceDescription.method,
    data: undefined,
    include: [],
    filters: {},
    headers: {},
  }

  /**
   * Allow to "clone" the current resource
   */
  function clone() {
    return createResource(meta, resourceDescription, parent).applyConfig(
      Object.assign({}, requestConfig)
    )
  }

  /**
   * Allow for post requests
   */
  function newEntity(data) {
    return overrideThen(
      clone().applyConfig({
        data,
        method: HTTP_VERB_POST,
        name: 'new',
      }),
      originalThen => ({
        create: () => new Promise(originalThen),
      })
    )
  }

  /**
   * Allow for patch requests
   */
  function updateEntity(data) {
    return overrideThen(
      clone().applyConfig({
        data,
        method: HTTP_VERB_PATCH,
        name: 'patch',
      }),
      originalThen => ({
        save: () => new Promise(originalThen),
      })
    )
  }

  /**
   * Allow to add response interceptors
   */
  const responseInterceptors = []
  function executeResponseInterceptors(response) {
    return responseInterceptors.reduce(
      (interceptee, interceptor) => interceptor(interceptee),
      response
    )
  }

  function deriveHeadersFromData(config) {
    const copy = Object.assign({}, config)

    const combinedCustomHeaders = Object.assign(
      {},
      resourceDescription.headers[ALL_HTTP_VERBS],
      resourceDescription.headers[copy.method]
    )

    const customHeaders = Object.keys(combinedCustomHeaders)
    customHeaders.reduce(
      (headers, key) =>
        Object.assign(headers, combinedCustomHeaders[key](copy.data[key])),
      copy.headers
    )

    /**
     * Remove data used to derive headers
     */
    copy.data = omit(copy.data, customHeaders)

    return copy
  }

  /**
   * Create the final request
   */
  function createRequest({ Realm, Authorization }) {
    return network(
      createCallConfig(
        {
          url: createURL(
            Realm,
            createParentURL(parent),
            resourceDescription.resource,
            resourceDescription.identifier
          ),
          headers: {
            Authorization,
          },
        },
        deriveHeadersFromData(requestConfig)
      )
    )
  }

  class Resource {
    constructor() {
      /**
       * Allow for sub resources
       */
      if (
        resourceDescription.sub_resources &&
        Object.keys(resourceDescription.sub_resources).length > 0
      ) {
        applyDecorators(withResources(resourceDescription.sub_resources, this))(
          this
        )
      }
    }

    include(...includes) {
      requestConfig.include = [...requestConfig.include, ...includes].map(
        String
      )

      validateIncludes({ resourceDescription, requestConfig })

      return this
    }

    filter(callback) {
      validateFilterCallback({ callback })

      /**
       * Create an object with each "filterable" value as a function
       */
      const filterable = resourceDescription.filters.reduce(
        (item, filter) =>
          Object.assign(item, {
            [filter](params) {
              requestConfig.filters = Object.assign({}, requestConfig.filters, {
                [filter]: Array.isArray(requestConfig.filters[filter])
                  ? [...requestConfig.filters[filter], ...params]
                  : params !== undefined ? params : true, // Convert undefined to true
              })
              return filterable
            },
          }),
        {}
      )

      validateFilterCallbackExecution({ resourceDescription }, () => {
        callback(filterable)
      })

      return this
    }

    addResponseInterceptor(callback) {
      validateAddResponseInterceptorCallback({ callback })

      responseInterceptors.push(callback)

      return this
    }

    // Allow to apply the config
    applyConfig(nextConfig) {
      Object.assign(requestConfig, nextConfig)

      return this
    }

    // eslint-disable-next-line class-methods-use-this
    then(onFulfilled, onRejected) {
      return identityProvider
        .getAuthorization(SHOULD_FORCE_AUTHORIZATION_REQUEST)
        .then(createRequest)
        .then(normalizeResponse)
        .then(executeResponseInterceptors)
        .then(onFulfilled, onRejected)
    }

    catch(onRejected) {
      return this.then(undefined, onRejected)
    }
  }

  /**
   * Expose all necessary information on __meta
   */
  return Object.defineProperties(new Resource(), {
    __meta: {
      enumerable: false,
      get() {
        return Object.assign(resourceDescription, {
          parent,
          identityProvider,
          network,
          requestConfig,
        })
      },
    },

    // Expose a .new(data) method on the Resource
    new: {
      enumerable: false,
      value: newEntity,
    },

    // Expose a .update(data) method on the Resource
    update: {
      enumerable: false,
      value: updateEntity,
    },
  })
}
