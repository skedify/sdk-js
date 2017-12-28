import convertIdsToString from '../../util/convertIdsToString'

export default function normalizeResponse(response) {
  const { data, warnings, meta } = convertIdsToString(response.data)

  return {
    status: response.status,
    headers: response.headers,
    data,
    warnings,
    meta,
  }
}
