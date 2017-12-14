import SkedifyAPI from './SkedifyAPI'

const Skedify = window.Skedify || {}

export default Skedify

if (window.self === window.top) {
  Object.defineProperty(Skedify, 'API', {
    enumerable: true,
    configurable: false,
    writable: false,
    value: SkedifyAPI,
  })
}
