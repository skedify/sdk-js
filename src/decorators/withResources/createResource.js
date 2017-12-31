/* eslint-disable class-methods-use-this */

import network from '../../util/network'

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
  identityProvider,
  resourceDescription,
  parent
) {
  const __data = {
    method: resourceDescription.method,
    data: resourceDescription.data,
    include: [],
    filters: {},
    headers: {},
  }

  const responseInterceptors = []

  function executeResponseInterceptors(response) {
    if (responseInterceptors.length <= 0) {
      return response
    }

    return responseInterceptors.reduce(
      (next, interceptor) => interceptor(next),
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
        __data
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

      /**
       * Binding on this
       */
      this.include = this.include.bind(this)
      this.filter = this.filter.bind(this)
      this.then = this.then.bind(this)
      this.catch = this.catch.bind(this)
    }

    include(...includes) {
      __data.include = [...__data.include, ...includes].map(String)

      validateIncludes({ resourceDescription, __data })

      return this
    }

    filter(callback) {
      validateFilterCallback({ callback, __data })

      /**
       * Create an object with each "filterable" value as a function
       */
      const filterable = resourceDescription.filters.reduce(
        (item, filter) =>
          Object.assign(item, {
            [filter](params) {
              __data.filters = Object.assign({}, __data.filters, {
                [filter]: Array.isArray(__data.filters[filter])
                  ? [...__data.filters[filter], ...params]
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

    then(resolve, reject) {
      return identityProvider
        .getAuthorization(SHOULD_FORCE_AUTHORIZATION_REQUEST)
        .then(createRequest)
        .then(normalizeResponse)
        .then(executeResponseInterceptors)
        .then(resolve, reject)
    }

    catch(reject) {
      return this.then(undefined, reject)
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
          __data,
        })
      },
    },
  })
}
