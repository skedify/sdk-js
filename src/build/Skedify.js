import SkedifyAPI from '../SkedifyAPI'

// eslint-disable-next-line better/no-typeofs
if (typeof window !== 'undefined') {
  window.Skedify = window.Skedify || {}

  /* istanbul ignore else */
  if (!window.Skedify.hasOwnProperty('API')) {
    Object.defineProperty(window.Skedify, 'API', {
      enumerable: true,
      value: SkedifyAPI,
    })
  }
}

export default SkedifyAPI
