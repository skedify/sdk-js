export default function createResourceDescription(
  resource,
  { includes = [], filters = [], headers = {} } = {},
  sub_resources = {}
) {
  return {
    resource,
    allowed_includes: includes,
    filters,
    sub_resources,
    headers,
  }
}
