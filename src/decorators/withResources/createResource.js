import { withResources } from '.'
import { applyDecorators } from '..'
import normalizeResponse from './normalizeResponse'

const SHOULD_FORCE_AUTHORIZATION_REQUEST = IS_TEST

import createCallConfig from './createCallConfig'
import {
  validateFilterCallback,
  validateIncludes,
  validateFilterCallbackExecution,
  validateAddResponseInterceptorCallback,
} from './invariants'

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

export default function createResource(
  { identityProvider, network },
  resourceDescription,
  parent
) {
  const requestConfig = {
    method: resourceDescription.method,
    data: resourceDescription.data,
    include: [],
    filters: {},
    headers: {},
  }

  const responseInterceptors = []

  function executeResponseInterceptors(response) {
    return responseInterceptors.reduce(
      (interceptee, interceptor) => interceptor(interceptee),
      response
    )
  }

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
        requestConfig
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
  })
}
