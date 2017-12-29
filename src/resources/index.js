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

export * from './appointments'
export * from './contacts'
export * from './customers'
export * from './employees'
export * from './enterpriseSettings'
export * from './offices'
export * from './subjects'
export * from './subjectCategories'
