export default function convertIdsToString(json) {
  if (json === null) {
    return json
  }

  if (Array.isArray(json)) {
    return json.map(convertIdsToString)
  }

  if (json instanceof Object) {
    return Object.keys(json).reduce((result, key) => {
      if (
        key === 'id' ||
        (key.length > 3 && key.lastIndexOf('_id') === key.length - 3)
      ) {
        result[key] =
          json[key] !== undefined && json[key] !== null
            ? json[key].toString()
            : json[key]
      } else {
        result[key] = convertIdsToString(json[key])
      }

      return result
    }, {})
  }

  return json
}
