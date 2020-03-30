const EXCEPTIONS = ['external_id']

export default function convertIdsToString(json) {
  if (json === null) {
    return json
  }

  if (Array.isArray(json)) {
    return json.map(convertIdsToString)
  }

  if (json instanceof Object) {
    return Object.keys(json).reduce((result, key) => {
      if (EXCEPTIONS.includes(key)) {
        return Object.assign(result, {
          [key]: convertIdsToString(json[key]),
        })
      }

      if (
        key === 'id' ||
        (key.length > 3 && key.lastIndexOf('_id') === key.length - 3)
      ) {
        return Object.assign(result, {
          [key]: json[key] != null ? json[key].toString() : json[key],
        })
      }

      if (
        (key === 'ids' ||
          (key.length > 4 && key.lastIndexOf('_ids') === key.length - 4)) &&
        Array.isArray(json[key])
      ) {
        return Object.assign(result, {
          [key]: json[key].map((item) =>
            item != null ? item.toString() : item
          ),
        })
      }

      return Object.assign(result, {
        [key]: convertIdsToString(json[key]),
      })
    }, {})
  }

  return json
}
