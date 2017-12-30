export default function createResourceDescription(
  resource,
  { includes = [], filters = [] } = {},
  sub_resources = {}
) {
  return {
    resource,
    allowed_includes: includes,
    filters,
    sub_resources,
  }
}
