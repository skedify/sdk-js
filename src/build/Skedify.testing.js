import { get } from '../secret'
import { install, uninstall } from '../../test/mock'

/**
 * Expose general test utils
 */
export {
  matchRequest,
  mockResponse,
  mockNoContent,
  mockMatchingURLResponse,
  mostRecentRequest,
  mockedRequests,
} from '../../test/testUtils'

/**
 * Expose an install mock function
 */
export function installSkedifySDKMock(instance, options = {}) {
  install(
    get(instance).network,
    Object.assign(
      {
        mockAccessTokensCall: true,
      },
      options
    )
  )
}

/**
 * Expose an uninstall mock function
 */
export function uninstallSkedifySDKMock(instance) {
  uninstall(get(instance).network)
}
