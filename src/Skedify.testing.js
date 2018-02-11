import moxios from 'moxios'

/**
 * Expose general test utils
 */
export { matchRequest, mockResponse } from '../test/testUtils'

/**
 * Expose an install mock function
 */
export function installSkedifySDKMock(instance) {
  moxios.install(instance.__meta.network)
}

/**
 * Expose an uninstall mock function
 */
export function uninstallSkedifySDKMock(instance) {
  moxios.uninstall(instance.__meta.network)
}
