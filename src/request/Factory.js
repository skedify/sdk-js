import XDomainFactory from './XDomainFactory'
import XMLHttpFactory from './XMLHttpFactory'

const Factory =
  window.XMLHttpRequest !== undefined &&
  'withCredentials' in new XMLHttpRequest()
    ? XMLHttpFactory
    : XDomainFactory

export default Factory

export const EVENT_LOAD = 'load'
export const EVENT_ERROR = 'error'
export const EVENT_TIMEOUT = 'timeout'
export const EVENT_ABORT = 'abort'
export const EVENT_PROGRESS = 'progress'
