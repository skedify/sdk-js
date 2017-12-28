import stringifyQueryParamValues from './stringifyQueryParamValues'

export default function createCallConfig(
  defaultConfig,
  { include, filters, method }
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
   * Return the config
   */
  return config
}
