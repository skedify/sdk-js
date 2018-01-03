/**
 * Export all constants
 */
export * from './constants/exported'

/**
 * Export util to create identity provider strings
 */
import createIdentityProviderString from './createIdentityProvider/createIdentityProviderString'
export const createAuthProviderString = createIdentityProviderString
