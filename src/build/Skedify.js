import SkedifyAPI from '../SkedifyAPI'

const Skedify = window.Skedify || {}

Object.defineProperty(Skedify, 'API', {
  enumerable: true,
  value: SkedifyAPI,
})

export default Skedify
