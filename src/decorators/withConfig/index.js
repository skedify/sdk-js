import validate from './validate'

import createError from '../../util/createError'

export function withConfig(initialConfig) {
  let _configuration = validate(initialConfig)

  function configure(config) {
    _configuration = validate(Object.assign({}, _configuration, config))
  }

  return instance => {
    Object.defineProperties(instance, {
      configure: {
        value(config) {
          return configure(config)
        },
        enumerable: true,
      },
      configuration: {
        get() {
          return Object.freeze(_configuration)
        },
        set() {
          throw createError(
            'You are not allowed to change the configuration object directly. Please use `.configure({})` instead.'
          )
        },
        enumerable: true,
      },
    })
  }
}
