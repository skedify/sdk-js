import createCollection from './createCollection'
import createIdentityProvider from './IdentityProvider'

// export default class SkedifyAPI {
//   constructor(idp) {
//     const identityProvider = createIdentityProvider(idp)

//     this.appointments = createCollection('/appointments', identityProvider)
//     this.subjects = createCollection('/subjects', identityProvider)
//     this.subject_categories = createCollection(
//       '/subject_categories',
//       identityProvider
//     )
//   }
// }

export default function SkedifyAPI(collectionName) {
  const collection = (optionalID, options) => {
    if (options === undefined) {
      options = optionalID
      optionalID = undefined
      // we're interacting with a collection
      const get = Promise.resolve([]) // schedule GET request
      get.create = (data) => {
        // cancel GET request
        // make POST factory
        const create  = Promise.resolve(data)
        create.validate = Promise.resolve(create)
        create.commit = Promise.resolve(data)
      }
      get.filter = () => get
      get.include = () => get
    } else {
      // we're interacting with an instance
    }
  }

  return collection
}

const endpoints = ['subjects', 'offices', 'enterprise_settings', 'timetable', 'appointments', 'contacts', 'customers']

Object.assign(
  SkedifyAPI,
  endpoints.reduce((bindings, endpoint) => {
    bindings[ // convert endpoint to camelCase for binding attribute name
      endpoint.replace(/_([a-z])/g, ([_, c]) => c.toUpperCase())
    ] = SkedifyAPI.bind(null, endpoint)
    return bindings
  })
)
