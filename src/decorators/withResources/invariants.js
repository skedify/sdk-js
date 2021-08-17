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
  ERROR_RESOURCE_MISSING_PAGING_METHOD,
} from '../../constants'
import { get } from '../../secret'

/**
 * Error when trying to use subresources but the parent has no `id`.
 */
export function validateParentId({ parent, name, identifier }) {
  const { descriptor } = get(parent)

  if (descriptor.identifier === undefined) {
    throw createResourceError(
      `You tried to call \`.${
        descriptor.name
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
  const { requestConfig, descriptor } = get(parent)

  if (
    Array.isArray(requestConfig.include) &&
    requestConfig.include.length > 0
  ) {
    throw createResourceError(
      `You tried to call \`.${name}(${
        identifier === undefined ? '' : JSON.stringify(identifier)
      })\` as a sub resource on \`.${descriptor.name}(${JSON.stringify(
        descriptor.identifier
      )})\`, but \`.include(${requestConfig.include
        .map((item) => `"${item}"`)
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
export function validateIncludes(resource) {
  const { descriptor, requestConfig } = get(resource)

  if (
    requestConfig.include.some(
      (include) => !descriptor.allowed_includes.includes(include)
    )
  ) {
    if (descriptor.allowed_includes.length === 0) {
      throw createResourceError(
        `You tried to call \`.include(${requestConfig.include
          .map((item) => `"${item}"`)
          .join(', ')})\` but there are no includes defined for ${
          descriptor.resource
        }.`,
        ERROR_RESOURCE,
        ERROR_RESOURCE_INVALID_INCLUDE
      )
    } else {
      throw createResourceError(
        `You tried to call \`.include(${requestConfig.include
          .map((item) => `"${item}"`)
          .join(', ')})\` but the only valid includes for ${
          descriptor.resource
        } are ${joinAsSpeech(
          AND,
          descriptor.allowed_includes.map((item) => `\`${item}\``)
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

export function validateFilterCallbackExecution(resource, run) {
  try {
    run()
  } catch (err) {
    const { descriptor } = get(resource)

    if (descriptor.filters.length <= 0) {
      throw createResourceError(
        `${err.message}. There are no filters defined for this resource.`,
        ERROR_RESOURCE,
        ERROR_RESOURCE_INVALID_FILTER
      )
    }

    throw createResourceError(
      `${err.message}. You can only call ${joinAsSpeech(
        OR,
        descriptor.filters.map((filter) => `\`.${filter.name || filter}()\``)
      )}.`,
      ERROR_RESOURCE,
      ERROR_RESOURCE_INVALID_FILTER
    )
  }
}

function getCallChain(resource, chain = []) {
  const { descriptor, parent } = get(resource)

  const next = [
    {
      name: descriptor.name,
      identifier: descriptor.identifier,
    },
    ...chain,
  ]

  if (parent === undefined) {
    return next
  }

  return getCallChain(parent, next)
}

export function validateDeprecations(resource) {
  const { descriptor } = get(resource)
  if (descriptor.deprecated) {
    // eslint-disable-next-line no-console
    console.warn(
      `The call to ${getCallChain(resource)
        .map(
          ({ name, identifier }) =>
            `.${name}(${
              identifier === undefined ? '' : JSON.stringify(identifier)
            })`
        )
        .join('')} is deprecated.`
    )
  }
}

export function validatePagingArguments(resource) {
  const { paging } = get(resource)
  const { per_page, page } = paging

  if ([per_page, page].some(Boolean)) {
    if (![per_page, page].every(Boolean)) {
      throw createResourceError(
        `Paging resources should both be called with limit() & page().`,
        ERROR_RESOURCE,
        ERROR_RESOURCE_MISSING_PAGING_METHOD
      )
    }
  }
}
