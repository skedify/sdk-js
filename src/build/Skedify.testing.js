import { get } from '../secret'
import { install, uninstall } from '../../test/mock'

/**
 * Expose general test utils
 */
export {
  matchRequest,
  mockResponse,
  mockMatchingURLResponse,
  mostRecentRequest,
  mockedRequests,
} from '../../test/testUtils'

/**
 * Expose an install mock function
 */
export function installSkedifySDKMock(instance) {
  install(get(instance).network)
}

/**
 * Expose an uninstall mock function
 */
export function uninstallSkedifySDKMock(instance) {
  uninstall(get(instance).network)
}
