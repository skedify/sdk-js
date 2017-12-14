import encode from './index'

export default function encodeArray(list, name = '') {
  return list.map((item, index) => encode(item, `${name}[${index}]`)).join('&')
}
