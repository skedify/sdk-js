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
    enable_id_filter = true,
    requires_domain_map = false,
  } = {},
  sub_resources = {}
) {
  return {
    resource,
    allowed_includes: includes,
    filters: [
      ...filters,
      ...(enable_pagination ? ['page', 'per_page'] : []),
      ...(enable_id_filter ? ['id'] : []),
    ],
    sub_resources,
    headers,
    allowed_methods,
    deprecated,
    requires_domain_map,
  }
}
