import moxios from 'moxios'
import { get } from '../src/secret'

/**
 * Expose general test utils
 */
export { matchRequest, mockResponse } from '../test/testUtils'

/**
 * Expose an install mock function
 */
export function installSkedifySDKMock(instance) {
  moxios.install(get(instance).network)
}

/**
 * Expose an uninstall mock function
 */
export function uninstallSkedifySDKMock(instance) {
  moxios.uninstall(get(instance).network)
}
