import * as resources from '../resources'

function collectIncludes(obj) {
  return Object.keys(obj).reduce((result, key) => {
    const { allowed_includes, sub_resources } = obj[key]

    if (Object.keys(sub_resources).length > 0) {
      return [...result, ...allowed_includes, ...collectIncludes(sub_resources)]
    }

    return [...result, ...allowed_includes]
  }, [])
}

function objectifyIncludes(collection) {
  return collection.reduce(
    (result, key) =>
      Object.assign(result, {
        [key]: {
          toString() {
            return key
          },
        },
      }),
    {}
  )
}

function unflattenDotNotation(obj) {
  return Object.keys(obj).reduce((result, key) => {
    key.split('.').reduce((innerObj, innerKey, index, dots) => {
      const isLast = index + 1 === dots.length
      const next = isLast ? obj[key] : innerObj[innerKey]

      innerObj[innerKey] = next

      return innerObj[innerKey]
    }, result)
    return result
  }, {})
}

export function withExposedIncludes() {
  return instance => {
    instance.include = unflattenDotNotation(
      objectifyIncludes(collectIncludes(resources))
    )
  }
}
