import { HTTP_VERB_ALL_WILDCARD } from '../../constants'

export default function createResourceDescription(
  resource,
  {
    includes = [],
    filters = [],
    headers = {},
    allowed_methods = [HTTP_VERB_ALL_WILDCARD],
    deprecated = false,
  } = {},
  sub_resources = {}
) {
  return {
    resource,
    allowed_includes: includes,
    filters,
    sub_resources,
    headers,
    allowed_methods,
    deprecated,
  }
}
