import convertIdsToString from '../../util/convertIdsToString'

export default function normalizeResponse(response) {
  const actualResponse =
    response instanceof Error // When the response is an error
      ? response.error instanceof Error // When the response is wrapped in a retry error
        ? response.error.response
        : response.response
      : response // When the response is normal

  // Throw actual network errors
  if (!actualResponse) {
    throw new Error(response.error ? response.error.message : response.message)
  }

  const { data, warnings, errors, meta } = convertIdsToString(
    actualResponse.data
  )

  return {
    status: actualResponse.status,
    headers: actualResponse.headers,
    data,
    warnings,
    errors,
    meta,
  }
}
