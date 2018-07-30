import SkedifyAPI from '../SkedifyAPI'

// eslint-disable-next-line better/no-typeofs
if (typeof window !== 'undefined') {
  window.Skedify = window.Skedify || {}

  /* istanbul ignore else */
  if (!window.Skedify.hasOwnProperty('API')) {
    window.Skedify.API = SkedifyAPI
  }
}

export default SkedifyAPI
