import stringifyQueryParamValues from './stringifyQueryParamValues'

export default function createCallConfig(
  defaultConfig,
  { include, filters, method, data }
) {
  const config = Object.assign({ method }, defaultConfig)

  /**
   * Setup includes
   */
  if (include.length > 0) {
    config.params = Object.assign({}, config.params, {
      include,
    })
  }

  /**
   * Setup filters
   */
  if (Object.keys(filters).length > 0) {
    config.params = Object.assign({}, config.params, filters)
  }

  /**
   * Setup params and stringify each value
   */
  config.params = stringifyQueryParamValues(config.params)

  /**
   * Setup post data
   */
  if (data !== undefined) {
    config.data = data
  }

  /**
   * Return the config
   */
  return config
}
