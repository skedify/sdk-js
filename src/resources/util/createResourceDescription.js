import { HTTP_VERB_ALL_WILDCARD } from '../../constants'

export default function createResourceDescription(
  resource,
  {
    includes = [],
    filters = [],
    headers = {},
    allowed_methods = [HTTP_VERB_ALL_WILDCARD],
    deprecated = false,
    enable_pagination = true,
  } = {},
  sub_resources = {}
) {
  return {
    resource,
    allowed_includes: includes,
    filters: enable_pagination ? [...filters, 'page', 'per_page'] : filters,
    sub_resources,
    headers,
    allowed_methods,
    deprecated,
  }
}
