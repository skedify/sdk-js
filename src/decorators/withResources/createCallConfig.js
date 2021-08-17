import { HTTP_VERB_GET, HTTP_VERB_ALL_WILDCARD } from '../../constants'
import { get } from '../../secret'
import stringifyQueryParamValues from './stringifyQueryParamValues'
import omit from '../../util/omit'

export default function createCallConfig(resource, defaultConfig) {
  const { requestConfig, descriptor, paging } = get(resource)

  const {
    include,
    filters,
    method = HTTP_VERB_GET,
    data,
    headers,
  } = requestConfig

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
   * Setup Paging
   */
  if (Object.keys(paging).length > 0) {
    config.params = Object.assign({}, config.params, paging)
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
   * Setup headers derived from `data`
   */
  const combinedHeaders = Object.assign(
    {},
    descriptor.headers[HTTP_VERB_ALL_WILDCARD],
    descriptor.headers[method]
  )

  const customHeaders = Object.keys(combinedHeaders)
  config.headers = customHeaders.reduce(
    (list, key) => Object.assign(list, combinedHeaders[key](config.data[key])),
    config.headers
  )

  /**
   * Remove data used to derive headers
   */
  config.data = omit(config.data, customHeaders)

  /**
   * Return the config
   */
  return config
}
