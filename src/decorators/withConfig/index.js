import validate from './validate'

import createError from '../../util/createError'
import isFunction from '../../util/isFunction'

export function withConfig(initialConfig) {
  let _configuration = validate(initialConfig)

  function configure(config) {
    _configuration = validate(Object.assign({}, _configuration, config))
  }

  const configurationChangeListeners = []

  return instance => {
    Object.defineProperties(instance, {
      configure: {
        value(config) {
          configure(config)

          configurationChangeListeners.forEach(listener =>
            listener(_configuration)
          )
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
      onConfigurationChange: {
        value(cb) {
          if (!isFunction(cb)) {
            throw createError(
              `You tried to call \`.onConfigurationChange(${cb})\` but it must receive a function.`
            )
          }

          // Add to the list of listeners
          configurationChangeListeners.push(cb)

          // Return an "un"-listen method
          return () => {
            const idx = configurationChangeListeners.indexOf(cb)

            configurationChangeListeners.splice(idx, 1)
          }
        },
      },
    })
  }
}
