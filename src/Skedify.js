import SkedifyAPI from './SkedifyAPI'

const Skedify = window.Skedify || {}

Object.defineProperty(Skedify, 'API', {
  enumerable: true,
  configurable: false,
  writable: false,
  value: SkedifyAPI,
})

export default Skedify
