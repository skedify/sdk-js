import axios from 'axios'

import deepClone from '../util/deepClone'
import { set } from '../secret'

export function withNetwork() {
  // We need an axios network instance for each "instance" of the sdk.
  return instance => {
    const network = axios.create()
    network.defaults.headers = deepClone(network.defaults.headers)

    set(instance, { network })
  }
}
