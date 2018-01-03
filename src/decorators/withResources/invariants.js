import {
  createResourceError,
  createResponseError,
} from '../../util/createError'
import { joinAsSpeech, AND, OR } from '../../util/joinAsSpeech'
import isFunction from '../../util/isFunction'

import {
  ERROR_RESOURCE_INVALID_FILTER,
  ERROR_RESOURCE_INVALID_INCLUDE,
  ERROR_RESOURCE_INVALID_RESPONSE_INTERCEPTOR,
  ERROR_RESOURCE,
  ERROR_RESPONSE_MULTIPLE_RESULTS_FOUND,
  ERROR_RESPONSE_NO_RESULTS_FOUND,
  ERROR_RESPONSE,
  ERROR_SUBRESOURCE_INCLUDE_ALREADY_CALLED,
  ERROR_SUBRESOURCE_INVALID_PARENT_ID,
} from '../../constants'

/**
 * Error when trying to use subresources but the parent has no `id`.
 */
export function validateParentId({ parent, name, identifier }) {
  if (parent.__meta.identifier === undefined) {
    throw createResourceError(
      `You tried to call \`.${
        parent.__meta.name
      }(/* MISSING IDENTIFIER */).${name}(${
        identifier === undefined ? '' : JSON.stringify(identifier)
      })\` but the parent id is missing.`,
      ERROR_RESOURCE,
      ERROR_SUBRESOURCE_INVALID_PARENT_ID
    )
  }
}

/**
 * Error when parent has includes defined already.
 */
export function validateIncludeAlreadyCalled({ parent, name, identifier }) {
  if (
    Array.isArray(parent.__meta.requestConfig.include) &&
    parent.__meta.requestConfig.include.length > 0
  ) {
    throw createResourceError(
      `You tried to call \`.${name}(${
        identifier === undefined ? '' : JSON.stringify(identifier)
      })\` as a sub resource on \`.${parent.__meta.name}(${JSON.stringify(
        parent.__meta.identifier
      )})\`, but \`.include(${parent.__meta.requestConfig.include
        .map(item => `"${item}"`)
        .join(
          ', '
        )})\` was already called and you can not call \`.include()\` before calling a sub resource.`,
      ERROR_RESOURCE,
      ERROR_SUBRESOURCE_INCLUDE_ALREADY_CALLED
    )
  }
}

/**
 * Only 1 value is allowed
 */
export function validateResponseFromExternalIdentifier({ response }) {
  if (response.data && response.data.length > 1) {
    throw Object.assign(
      createResponseError(
        'Multiple results found',
        ERROR_RESPONSE,
        ERROR_RESPONSE_MULTIPLE_RESULTS_FOUND
      ),
      { response, alternatives: response.data }
    )
  }

  if (!response.data || response.data.length <= 0) {
    throw Object.assign(
      createResponseError(
        'No results found',
        ERROR_RESPONSE,
        ERROR_RESPONSE_NO_RESULTS_FOUND
      ),
      { response }
    )
  }
}

/**
 * Error when the resource includes "includes" that are not recognized for the current resource
 */
export function validateIncludes({ resourceDescription, requestConfig }) {
  if (
    requestConfig.include.some(
      include => !resourceDescription.allowed_includes.includes(include)
    )
  ) {
    if (resourceDescription.allowed_includes.length === 0) {
      throw createResourceError(
        `You tried to call \`.include(${requestConfig.include
          .map(item => `"${item}"`)
          .join(', ')})\` but there are no includes defined for ${
          resourceDescription.resource
        }.`,
        ERROR_RESOURCE,
        ERROR_RESOURCE_INVALID_INCLUDE
      )
    } else {
      throw createResourceError(
        `You tried to call \`.include(${requestConfig.include
          .map(item => `"${item}"`)
          .join(', ')})\` but the only valid includes for ${
          resourceDescription.resource
        } are ${joinAsSpeech(
          AND,
          resourceDescription.allowed_includes.map(item => `\`${item}\``)
        )}.`,
        ERROR_RESOURCE,
        ERROR_RESOURCE_INVALID_INCLUDE
      )
    }
  }
}

export function validateAddResponseInterceptorCallback({ callback }) {
  if (!isFunction(callback)) {
    throw createResourceError(
      `You tried to call \`.addResponseInterceptor(${callback})\` but it must receive a function.`,
      ERROR_RESOURCE,
      ERROR_RESOURCE_INVALID_RESPONSE_INTERCEPTOR
    )
  }
}

export function validateFilterCallback({ callback }) {
  if (!isFunction(callback)) {
    throw createResourceError(
      `\`.filter()\` expects a callback, but is given \`.filter(${callback})\``,
      ERROR_RESOURCE,
      ERROR_RESOURCE_INVALID_FILTER
    )
  }
}

export function validateFilterCallbackExecution({ resourceDescription }, run) {
  try {
    run()
  } catch (err) {
    throw createResourceError(
      `${err.message}. You can only call ${joinAsSpeech(
        OR,
        resourceDescription.filters.map(filter => `\`.${filter}()\``)
      )}.`,
      ERROR_RESOURCE,
      ERROR_RESOURCE_INVALID_FILTER
    )
  }
}
