import validate from './validate'

import { createConfigError } from '../../util/createError'
import isFunction from '../../util/isFunction'

export function withConfig(initialConfig) {
  let _configuration = validate(initialConfig)

  const configurationChangeListeners = []

  return instance => {
    Object.defineProperties(instance, {
      configure: {
        value(config) {
          _configuration = validate(Object.assign({}, _configuration, config))

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
          throw createConfigError(
            'You are not allowed to change the configuration object directly. Please use `.configure({})` instead.'
          )
        },
        enumerable: true,
      },
      onConfigurationChange: {
        value(cb) {
          if (!isFunction(cb)) {
            throw createConfigError(
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
