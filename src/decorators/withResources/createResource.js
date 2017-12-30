/* eslint-disable class-methods-use-this */

import network from '../../util/network'

import { withResources } from '.'
import { applyDecorators } from '..'
import createError from '../../util/createError'
import isFunction from '../../util/isFunction'
import normalizeResponse from './normalizeResponse'

import joinAsSpeech, { AND, OR } from '../../util/joinAsSpeech'

import {
  ERROR_RESOURCE,
  ERROR_RESOURCE_INVALID_INCLUDE,
  ERROR_RESOURCE_INVALID_FILTER,
  ERROR_RESOURCE_INVALID_RESPONSE_INTERCEPTOR,
} from '../../constants'

const SHOULD_FORCE_AUTHORIZATION_REQUEST = IS_TEST

import createCallConfig from './createCallConfig'

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

export default function createResource(identityProvider, resourceInfo, parent) {
  const __data = {
    method: 'get',
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
            resourceInfo.resource,
            resourceInfo.identifier
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
        resourceInfo.sub_resources &&
        Object.keys(resourceInfo.sub_resources).length > 0
      ) {
        applyDecorators(withResources(resourceInfo.sub_resources, this))(this)
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

      if (
        __data.include.some(
          include => !resourceInfo.allowed_includes.includes(include)
        )
      ) {
        if (resourceInfo.allowed_includes.length === 0) {
          throw createError(
            `You tried to call \`.include(${__data.include
              .map(item => `"${item}"`)
              .join(', ')})\` but there are no includes defined for ${
              resourceInfo.resource
            }.`,
            ERROR_RESOURCE,
            ERROR_RESOURCE_INVALID_INCLUDE
          )
        } else {
          throw createError(
            `You tried to call \`.include(${__data.include
              .map(item => `"${item}"`)
              .join(', ')})\` but the only valid includes for ${
              resourceInfo.resource
            } are ${joinAsSpeech(
              AND,
              resourceInfo.allowed_includes.map(item => `\`${item}\``)
            )}.`,
            ERROR_RESOURCE,
            ERROR_RESOURCE_INVALID_INCLUDE
          )
        }
      }

      return this
    }

    filter(callback) {
      if (!isFunction(callback)) {
        throw createError(
          `\`.filter()\` expects a callback, but is given \`.filter(${callback})\``,
          ERROR_RESOURCE,
          ERROR_RESOURCE_INVALID_FILTER
        )
      }

      const filterable = resourceInfo.filters.reduce(
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

      try {
        callback(filterable)
      } catch (err) {
        throw createError(
          `${err.message}. You can only call ${joinAsSpeech(
            OR,
            resourceInfo.filters.map(filter => `\`.${filter}()\``)
          )}.`,
          ERROR_RESOURCE,
          ERROR_RESOURCE_INVALID_FILTER
        )
      }

      return this
    }

    addResponseInterceptor(cb) {
      if (!isFunction(cb)) {
        throw createError(
          `You tried to call \`.addResponseInterceptor(${cb})\` but it must receive a function.`,
          ERROR_RESOURCE,
          ERROR_RESOURCE_INVALID_RESPONSE_INTERCEPTOR
        )
      }

      responseInterceptors.push(cb)

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
        return Object.assign(resourceInfo, {
          parent,
          identityProvider,
          __data,
        })
      },
    },
  })
}
