import { HTTP_VERB_ALL_WILDCARD } from '../../constants'

export default function createResourceDescription(
  resource,
  {
    includes = [],
    filters = [],
    headers = {},
    method = undefined,
    allowed_methods = [HTTP_VERB_ALL_WILDCARD],
  } = {},
  sub_resources = {}
) {
  return {
    resource,
    allowed_includes: includes,
    filters,
    sub_resources,
    headers,
    method,
    allowed_methods,
  }
}
