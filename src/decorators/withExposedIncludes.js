import * as resources from '../resources'
import unique from '../util/unique'
import flatten from '../util/flatten'
import buildChain from '../util/buildChain'

function collectIncludes(obj) {
  return Object.keys(obj).reduce((result, key) => {
    const { allowed_includes, sub_resources } = obj[key]

    if (Object.keys(sub_resources).length > 0) {
      return [...result, ...allowed_includes, ...collectIncludes(sub_resources)]
    }

    return [...result, ...allowed_includes]
  }, [])
}

function ensureAllIncludesExist(includes) {
  const all_includes = includes.map(include => buildChain(include, '.'))
  return unique(flatten(all_includes)).sort((a, b) => a.length - b.length)
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
    key.split('.').reduce((inner_obj, inner_key, index, dots) => {
      const is_last = index + 1 === dots.length
      const next = is_last ? obj[key] : inner_obj[inner_key]

      inner_obj[inner_key] = next

      return inner_obj[inner_key]
    }, result)
    return result
  }, {})
}

function pipe(...fns) {
  return input => fns.reduce((value, fn) => fn(value), input)
}

export function withExposedIncludes() {
  const getIncludes = pipe(
    collectIncludes,
    ensureAllIncludesExist,
    objectifyIncludes,
    unflattenDotNotation
  )

  return instance => {
    instance.include = getIncludes(resources)
  }
}
