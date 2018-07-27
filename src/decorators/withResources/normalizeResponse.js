import convertIdsToString from '../../util/convertIdsToString'

export default function normalizeResponse(response) {
  const { data, warnings, errors, meta } = convertIdsToString(response.data)

  return {
    status: response.status,
    headers: response.headers,
    data,
    warnings,
    errors,
    meta,
  }
}
