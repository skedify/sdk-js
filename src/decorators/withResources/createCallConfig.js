import stringifyQueryParamValues from './stringifyQueryParamValues'

import { HTTP_VERB_GET } from '../../constants'

export default function createCallConfig(
  defaultConfig,
  { include, filters, method = HTTP_VERB_GET, data, headers }
) {
  const config = Object.assign({ method, data }, defaultConfig)

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
   * Setup headers
   */
  config.headers = Object.assign({}, config.headers, headers)

  /**
   * Return the config
   */
  return config
}
