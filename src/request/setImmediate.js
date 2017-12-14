const setImmediate = window.setImmediate
  ? function setImmediate(callback) {
      const timer = window.setImmediate(callback)

      return window.clearImmediate.bind(window, timer)
    }
  : function setImmediate(callback) {
      const timer = window.setTimeout(callback, 0)

      return window.clearTimeout.bind(window, timer)
    }

export default setImmediate
