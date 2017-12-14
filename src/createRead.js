import wait from './util/wait'

export default function createRead({ createRequestAsDescribed, path }) {
  const description = {
    path,
    method: 'GET',
    payload: {},
    query: {},
  }

  const read = Object.assign(
    wait(0).then(() =>
      createRequestAsDescribed(description).then(response => response.body.data)
    ),
    {
      filter(filters) {
        Object.getOwnPropertyNames(filters).forEach(filter => {
          description.query[filter] = filters[filter]
        })
        return this
      },
      include(...includes) {
        description.query.include = [
          ...(description.query.include || []),
          ...includes,
        ].join(',')
        return this
      },
      create() {
        description.method = 'POST'
        return this
      },
      update() {
        description.method = 'PATCH'
        return this
      },
      replace() {
        description.method = 'PUT'
        return this
      },
      delete() {
        description.method = 'DELETE'
        return this
      },
    }
  )
  return read
}
