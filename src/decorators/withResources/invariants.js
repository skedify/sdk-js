import createError from '../../util/createError'

import {
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
export function validateInvalidParentId({ parent, key, identifier }) {
  if (parent.__meta.identifier === undefined) {
    throw createError(
      `You tried to call \`.${
        parent.__meta.name
      }(/* MISSING IDENTIFIER */).${key}(${
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
export function validateIncludeAlreadyCalled({ parent, key, identifier }) {
  if (
    Array.isArray(parent.__meta.__data.include) &&
    parent.__meta.__data.include.length > 0
  ) {
    throw createError(
      `You tried to call \`.${key}(${
        identifier === undefined ? '' : JSON.stringify(identifier)
      })\` as a sub resource on \`.${parent.__meta.name}(${JSON.stringify(
        parent.__meta.identifier
      )})\`, but \`.include(${parent.__meta.__data.include
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
export function validateMultipleResultsFound({ response }) {
  if (response.data && response.data.length > 1) {
    throw Object.assign(
      createError(
        'Multiple results found',
        ERROR_RESPONSE,
        ERROR_RESPONSE_MULTIPLE_RESULTS_FOUND
      ),
      { response, alternatives: response.data }
    )
  }
}

/**
 * No results found
 */
export function validateNoResultsFound({ response }) {
  throw Object.assign(
    createError(
      'No results found',
      ERROR_RESPONSE,
      ERROR_RESPONSE_NO_RESULTS_FOUND
    ),
    { response }
  )
}
