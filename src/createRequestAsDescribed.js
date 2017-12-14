import request from './request'

export default function createRequestAsDescribed({ identityProvider }) {
  return function requestAsDescribed(description) {
    return identityProvider
      .getAuthorization()
      .then(({ Realm, Authorization }) =>
        request(`${Realm}${description.path}`, description.payload, {
          method: description.method,
          headers: {
            Authorization,
          },
        }).then(response => response.body)
      )
  }
}
