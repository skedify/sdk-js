/* eslint-disable max-statements */
import { get, set } from '../../secret'
import createCallConfig from './createCallConfig'
import retry from '../../util/retry'
import { HTTP_VERB_DELETE } from '../../constants'

// istanbul ignore next
// eslint-disable-next-line no-process-env
const MAX_BULK_SIZE = process.env.NODE_ENV === 'test' ? 3 : 512

function createURL(...parts) {
  return parts.filter(Boolean).join('/')
}

function createParentURL(parent) {
  if (parent === undefined) {
    return undefined
  }

  const { parent: grandParent, descriptor } = get(parent)

  return createURL(
    createParentURL(grandParent),
    descriptor.resource,
    descriptor.identifier && encodeURIComponent(descriptor.identifier)
  )
}

function group(input, per_group) {
  const total_groups = Math.ceil(input.length / per_group)
  const groups = []

  // eslint-disable-next-line
  for (let i = 0; i < total_groups; ++i) {
    const offset = i * per_group
    groups.push(input.slice(offset, offset + per_group))
  }

  return groups
}

function resolveData(response) {
  // When get a 204 (No Content) or when the data is empty (in cases of a full
  // successful delete) we still want to know the data that was used. Therefore
  // we will use the requested data.
  return response.status === 204 || !response.data // No contents gives `data: ""`
    ? JSON.parse(response.config.data) // The incoming data
    : response.data.data
}

function mergeResponseObjects(left_hand_side, right_hand_side) {
  // When they are the same, then we don't need to merge.
  // istanbul ignore next
  if (left_hand_side === right_hand_side) {
    return left_hand_side
  }

  // We don't want to do anything with arrays. The reason we have this is that
  // our API returns an `[]` for an empty object. Thanks php!
  // istanbul ignore next
  if (Array.isArray(right_hand_side)) {
    return left_hand_side
  }

  // When the left hand side is undefined, we can just take the right hand side.
  // But this can only be done if and only if it is an object because we only
  // want to merge objects here.
  if (
    left_hand_side === undefined &&
    // eslint-disable-next-line better/no-typeofs
    typeof right_hand_side === 'object' &&
    right_hand_side !== null
  ) {
    return right_hand_side
  }

  // Merge everything together
  return Object.assign({}, left_hand_side, right_hand_side)
}

function mergeResponseArrays(left_hand_side, right_hand_side) {
  // When they are the same, then we don't need to merge.
  // istanbul ignore next
  if (left_hand_side === right_hand_side) {
    return left_hand_side
  }

  // We don't want to do anything with non-arrays.
  // istanbul ignore next
  if (!Array.isArray(right_hand_side)) {
    return left_hand_side
  }

  // Add the items from the right hand side
  if (Array.isArray(left_hand_side)) {
    left_hand_side.push(...right_hand_side)
    return left_hand_side
  }

  return right_hand_side
}

function resolveResponse(response) {
  if (response instanceof Error) {
    return response.response
  }

  return response
}

function stitchResponsesTogether([first_response, ...responses]) {
  const resolved_first_resposne = resolveResponse(first_response)

  // We should never hit this, but this is a good safety net to have in place.
  // istanbul ignore next
  if (responses.length <= 0) {
    return resolved_first_resposne
  }

  // We can make some assumptions here. A bulk action will always be to the same
  // url, with the same method and so on.
  const stitched_response = {
    ...resolved_first_resposne,
  }

  // We will need the offset to update the `index` of errors when they occur in
  // further responses.
  const state = {
    offset: resolveData(resolved_first_resposne).length,
  }

  // Ensure we don't override the initial request.
  stitched_response.config = { ...stitched_response.config }

  // In case of a No Content, we won't have data, therefore we can default to an
  // empty array in the data.
  if (!stitched_response.data) {
    stitched_response.data = { data: [], meta: {}, warnings: [], errors: [] }
  }

  stitched_response.data.data = resolveData(stitched_response).slice()

  // Make the initial request extendable.
  stitched_response.config.data = JSON.parse(stitched_response.config.data)

  // eslint-disable-next-line better/no-fors
  for (const idx in responses) {
    const response = resolveResponse(responses[idx])
    const data = resolveData(response)

    // Merge all the config data!
    stitched_response.config.data.push(...data)
    Object.assign(stitched_response.config.headers, response.config.headers)

    // Merge the actual responses..
    stitched_response.data.data.push(...data)

    if (response && response.data) {
      // Try and merge the meta object
      if (response.data.meta) {
        stitched_response.data.meta = mergeResponseObjects(
          stitched_response.data.meta,
          response.data.meta
        )
      }

      // Try and merge the warnings array
      if (response.data.warnings) {
        stitched_response.data.warnings = mergeResponseArrays(
          stitched_response.data.warnings,
          response.data.warnings
        )
      }

      // Try and merge the errors array
      if (response.data.errors) {
        stitched_response.data.errors = mergeResponseArrays(
          stitched_response.data.errors,
          response.data.errors.map((error) => {
            // When an `index` exists on the error, we have to increase it
            // with the _known_ offset.
            // istanbul ignore else
            if (error.index !== undefined) {
              return Object.assign({}, error, {
                index: error.index + state.offset,
              })
            }

            // istanbul ignore next
            return error
          })
        )
      }
    }

    // When the status codes are different, it must be a 207
    if (stitched_response.status !== response.status) {
      stitched_response.status = 207 // Multi-Status
    }

    // Update the offset for the next response batch: When we get a 204 (No
    // Content) or when the data is empty (in cases of a full successful delete)
    // we still want to know the offset for further responses. Therefore we can
    // use the length of the requested data.
    state.offset += data.length
  }

  // Ensure the same api, this should be a string again!
  stitched_response.config.data = JSON.stringify(stitched_response.config.data)

  // When the final stitched result is still a 204 (No Content) then it means
  // that everything was successful in case of a delete. This also means that we
  // don't need to have our data filled so that our indexes match. Long story
  // short, we can clear the data again!
  if (stitched_response.status === 204) {
    stitched_response.data = '' // Original response
  }

  return stitched_response
}

function handleBulkActions(callConfig, cb) {
  // Not a bulk action
  if (!Array.isArray(callConfig.data)) {
    return cb(callConfig)
  }

  // Didn't reach the limit yet, let's just continue
  if (callConfig.data.length <= MAX_BULK_SIZE) {
    return cb(callConfig)
  }

  // Time to splitup the data!
  return Promise.all(
    // Promise.all guarantees the order, which is very kind of them!
    group(callConfig.data, MAX_BULK_SIZE).map((slice) => {
      // Create a shallow copy because we don't want to touch shared stuff!
      const copy = { ...callConfig }

      // Override the callConfig with this slice of data
      copy.data = slice

      // Execute the call, but ensure to always resolve so that we later can
      // stitch everything nicely together as if it was a single request.
      return cb(copy).catch((err) => err)
    })
  ).then(stitchResponsesTogether)
}

export default function createRequest(
  resourceEntity,
  { Realm, Authorization }
) {
  const { instance, descriptor, resource_path, parent, requestConfig } =
    get(resourceEntity)
  const { identityProvider, resource_domain_map } = get(instance)

  const callConfig = createCallConfig(
    resourceEntity,
    Object.assign(
      {
        url: createURL(
          resource_domain_map[resource_path] !== undefined
            ? resource_domain_map[resource_path].url
            : Realm,
          createParentURL(parent),
          descriptor.resource,

          requestConfig.method === HTTP_VERB_DELETE &&
            Array.isArray(descriptor.identifier)
            ? undefined // We can omit the identifier when it is a DELETE of multiple resources
            : descriptor.identifier
        ),

        headers: Object.assign(
          {},
          resource_domain_map[resource_path] !== undefined
            ? resource_domain_map[resource_path].headers
            : {},
          { Authorization }
        ),
      },

      // Convert the list of id's to the data body when it is a delete
      requestConfig.method === HTTP_VERB_DELETE &&
        Array.isArray(descriptor.identifier)
        ? { data: descriptor.identifier }
        : {}
    )
  )

  function tryToRecoverFromErrors(err) {
    // Try to recover from 401 by refreshing the token.
    if (err && err.response && err.response.status === 401) {
      return identityProvider
        .getAuthorization(true)
        .then(createRequest.bind(null, resourceEntity))
    }

    // Forward the error if it is not recoverable
    throw err
  }

  const { network } = get(instance)

  set(resourceEntity, {
    is_bulk_request: Array.isArray(callConfig.data),
  })

  return callConfig.method === 'get'
    ? retry((resolve, reject) => {
        network(callConfig).catch(tryToRecoverFromErrors).then(resolve, reject)
      })
    : handleBulkActions(callConfig, (config) =>
        network(config).catch(tryToRecoverFromErrors)
      )
}
