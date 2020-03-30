/* eslint-disable better/no-typeofs */
import axios from 'axios'

import deepClone from '../util/deepClone'
import { set } from '../secret'

export function withNetwork() {
  // We need an axios network instance for each "instance" of the sdk.
  return (instance) => {
    const network = axios.create()

    // If we are in a node environment, use the http adapter
    /* istanbul ignore else */
    if (typeof process !== 'undefined') {
      network.defaults.adapter = require('axios/lib/adapters/http') // eslint-disable-line global-require
    }

    network.defaults.headers = deepClone(network.defaults.headers)

    set(instance, { network })
  }
}
