export default function triggerCallbacks(list, ...args) {
  list.forEach(callback => {
    try {
      callback(...args)
    } catch (e) {
      // silently ignore callbacks that fail
    }
  })
}
