import { createGrant } from './createGrant'

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
    ({ network, realm, parameters }) =>
      // Setup all the required parts to authenticate
      Promise.resolve(parameters)
        .then(({ token_type, access_token }) => ({
          Authorization: `${token_type} ${access_token}`,
          Realm: realm,
        }))

        // Get the proxy url
        .then(({ Realm, Authorization }) =>
          network
            .get(`${Realm}/integrations/proxy`, {
              headers: { Authorization },
            })
            .then(({ data: response }) => ({
              Realm: response.data.url,
              Authorization,
            }))
        )
  ),
}
