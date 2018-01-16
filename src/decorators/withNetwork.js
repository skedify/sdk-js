import axios from 'axios'
import deepClone from '../util/deepClone'

export function withNetwork() {
  // We need an axios network instance for each "instance" of the sdk.
  return instance => {
    instance.__meta.network = axios.create()
    instance.__meta.network.defaults.headers = deepClone(
      instance.__meta.network.defaults.headers
    )
  }
}
