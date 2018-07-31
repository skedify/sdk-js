import convertIdsToString from '../../util/convertIdsToString'

function resolveResponse(response) {
  // When the response is an error
  if (response instanceof Error) {
    if (response.error instanceof Error) {
      // When the response is wrapped in a retry error
      return [response.error, response.error.response]
    }

    // WHen the response is just an error
    return [response, response.response]
  }

  // When the response is normal
  return [undefined, response]
}

export default function normalizeResponse(incomingResponse) {
  const [error, response] = resolveResponse(incomingResponse)

  // Throw actual network errors
  if (!response) {
    throw new Error(error.message)
  }

  const { data, warnings, errors, meta } = convertIdsToString(response.data)

  const responseBag = {
    status: response.status,
    headers: response.headers,
    data,
    warnings,
    errors,
    meta,
  }

  if (error) {
    throw responseBag
  }

  return responseBag
}
