import { createGrant } from './createGrant'
import { get } from '../../secret'

export const IDPS = {
  client_credentials: createGrant(
    'client_credentials',
    ['client_id', 'client_secret'],
    ['scope']
  ),
  office365_code: createGrant('office365_code', ['code', 'client_id']),
  password: createGrant(
    'password',
    ['client_id', 'client_secret', 'username', 'password'],
    ['scope', 'enterprise_id']
  ),
  public_client: createGrant('public_client', ['client_id'], ['scope']),
  public_client_password: createGrant(
    'public_client_password',
    ['client_id', 'username', 'password'],
    ['scope', 'enterprise_id']
  ),
  public_client_password_reset: createGrant(
    'public_client_password_reset',
    ['client_id', 'username'],
    ['password']
  ),
  resource_code: createGrant('resource_code', ['client_id', 'code']),
  saml: createGrant('saml', ['payload', 'enterprise_id', 'client_id']),

  token: createGrant(
    'token',
    ['token_type', 'access_token'],
    [],
    ({ instance, realm, parameters }) => {
      const { network } = get(instance)

      // Setup all the required parts to authenticate
      return (
        Promise.resolve(parameters)
          .then(({ token_type, access_token }) => ({
            Authorization: `${token_type} ${access_token}`,
            Realm: realm,
          }))

          // Get the proxy url
          .then(auth_response => {
            // Let's not use the proxy when in node environments
            // eslint-disable-next-line better/no-typeofs
            if (typeof window === 'undefined') {
              return auth_response
            }

            const { Realm, Authorization } = auth_response
            return network
              .get(`${Realm}/integrations/proxy`, {
                headers: { Authorization },
              })
              .then(({ data: response }) => ({
                Realm: response.data.url,
                Authorization,
              }))
          })

          // Check if the identity call works for grant_type = token. This way we
          // have our error handling in 1 single spot (createGrant) because when
          // this fails, the error will be caught in the getAuthorization() fn.
          // Downside is that we now _have_ to do an identity call.
          .then(auth_response => {
            const { Authorization, Realm } = auth_response
            return network
              .get(`${Realm}/identity`, {
                headers: { Authorization },
              })
              .then(() => auth_response)
          })
      )
    }
  ),

  testing: createGrant('testing', [], [], ({ realm, parameters }) =>
    Promise.resolve(parameters).then(() => ({
      Authorization: `Bearer testing-access-token`,
      Realm: realm,
    }))
  ),
}
