import request from './request'
import wait from './util/wait'

export default function createCollection(path, identityProvider) {
  return {
    list() {
      const payload = {}

      const delayed_get = Object.assign(
        wait(0).then(() =>
          identityProvider.getAuthorization().then(({ Realm, Authorization }) =>
            request(`${Realm}${path}`, payload, {
              method: 'GET',
              headers: {
                Authorization,
              },
            }).then(response => response.body.data)
          )
        ),
        {
          filter(filters) {
            Object.getOwnPropertyNames(filters).forEach(filter => {
              payload[filter] = filters[filter]
            })
          },
          include(...includes) {
            payload.include = [...(payload.include || []), ...includes].join(
              ','
            )
          },
        }
      )
      return delayed_get
    },

    create(data, options) {
      return new Promise((fulfill, reject) => {
        /* eslint-disable */
        debugger;
        console.log("creating instance", data, options);
        reject(Error("NOT_IMPLEMENTED_YET"));
        /* eslint-enable */
      })
    },

    select(id, options) {
      let dorequest = true
      const instance = new Promise((fulfill, reject) => {
        if (dorequest) {
          /* eslint-disable */
          debugger;
          console.log("selecting instance", id, options);
          reject(Error("NOT_IMPLEMENTED_YET"));
          /* eslint-enable */
        }
      })

      instance.edit = function edit(data) {
        dorequest = false
        return new Promise((fulfill, reject) => {
          /* eslint-disable */
          debugger;
          console.log("editing instance", id, data, options);
          reject(Error("NOT_IMPLEMENTED_YET"));
          /* eslint-enable */
        })
      }
      instance.replace = function replace(data) {
        dorequest = false
        return new Promise((fulfill, reject) => {
          /* eslint-disable */
          debugger;
          console.log("replacing instance", id, data, options);
          reject(Error("NOT_IMPLEMENTED_YET"));
          /* eslint-enable */
        })
      }
      instance.delete = function deleteFn() {
        dorequest = false
        return new Promise((fulfill, reject) => {
          /* eslint-disable */
          debugger;
          console.log("deleting instance", id);
          reject(Error("NOT_IMPLEMENTED_YET"));
          /* eslint-enable */
        })
      }
      return instance
    },
  }
}
