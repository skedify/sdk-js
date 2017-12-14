export default function encodeString(str, name) {
  return [
    name === undefined ? '' : `${encodeString(name)}=`,
    encodeURIComponent(str)
      .replace(/[!'()*]/g, c => `%${c.charCodeAt(0).toString(16)}`)
      .replace('%20', '+'),
  ].join('')
}
