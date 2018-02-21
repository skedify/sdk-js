export default function omit(obj, keys = []) {
  // eslint-disable-next-line better/no-typeofs
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return obj
  }

  return Object.keys(obj).reduce((result, key) => {
    if (keys.includes(key)) {
      return result
    }

    return Object.assign(result, {
      [key]: obj[key],
    })
  }, {})
}
