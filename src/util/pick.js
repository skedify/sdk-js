export default function pick(object, ...props) {
  if (Array.isArray(object)) {
    return object.slice().filter(k => props.includes(k))
  }

  return Object.keys(object)
    .filter(k => props.includes(k))
    .reduce(
      (a, k) =>
        Object.assign(a, {
          [k]: object[k],
        }),
      {}
    )
}
