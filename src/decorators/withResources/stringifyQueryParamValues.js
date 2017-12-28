import unique from '../../util/unique'

export default function stringifyQueryParamValues(params) {
  if (params === undefined || params === null) {
    return params
  }

  return Object.keys(params).reduce(
    (stringifiedQueryParams, key) =>
      Object.assign(stringifiedQueryParams, {
        [key]: Array.isArray(params[key])
          ? unique(params[key]).join(',')
          : params[key],
      }),
    {}
  )
}
