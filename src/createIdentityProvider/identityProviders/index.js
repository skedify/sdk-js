import { createIdentityProvider } from './createIdentityProvider'
import Token from './Token'

export const IDPS = {
  client_credentials: createIdentityProvider(
    'client_credentials',
    ['client_id', 'client_secret'],
    ['scope']
  ),
  office365_code: createIdentityProvider('office365_code', [
    'code',
    'client_id',
  ]),
  password: createIdentityProvider(
    'password',
    ['client_id', 'client_secret', 'username', 'password'],
    ['scope', 'enterprise_id']
  ),
  public_client: createIdentityProvider(
    'public_client',
    ['client_id'],
    ['scope']
  ),
  public_client_password: createIdentityProvider(
    'public_client_password',
    ['client_id', 'username', 'password'],
    ['scope', 'enterprise_id']
  ),
  public_client_password_reset: createIdentityProvider(
    'public_client_password_reset',
    ['client_id', 'username'],
    ['password']
  ),
  resource_code: createIdentityProvider('resource_code', ['client_id', 'code']),
  saml: createIdentityProvider('saml', [
    'payload',
    'enterprise_id',
    'client_id',
  ]),

  token: Token,
}
