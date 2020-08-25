/**
 * This code is copied from:
 * - https://www.npmjs.com/package/uuid
 * - https://github.com/uuidjs/uuid/tree/v8.3.0
 *
 * The issue with the UUID package is that it support EITHER
 * the browser OR NodeJS, but not both at the same time.
 * This is an issue because we use the SDK in both the Browser & NodeJS.
 *
 * In rollup.config.common.js you can see that we build for the browser (node-resolve rollup plugin)
 * Because of that the UUID package would be broken in our NodeJS packages.
 *
 * The fix here is inside the `rng()` function, where we check if the `getRandomValues` exists
 * If it doesn't we use `crypto.randomFillSync` instead.
 *
 * Note that the code here was also SHRUNK DOWN for our use case. It doesn't have the same support as the real package!
 * We only keep what we need!
 *
 * Interesting: There is also a proposal to make UUID a standard in JavaScript: https://github.com/tc39/proposal-uuid
 * Might be something we can use in the future if it actually becomes a thing!
 */

const rnds8 = new Uint8Array(16)

/* eslint-disable better/no-typeofs,no-undef */
const IS_NODE_ENVIRONMENT =
  typeof navigator === 'undefined' || navigator.userAgent.indexOf('jsdom') >= 0

// If JSDom is detected then we are in a testing environment
// We want this to count as a Node environment as well

/* istanbul ignore next */
function rng() {
  if (IS_NODE_ENVIRONMENT) {
    // If we're here, we're in a NodeJS environment
    return crypto.randomFillSync(rnds8)
  }

  // For Browsers, including IE11
  const getRandomValues =
    (typeof crypto !== 'undefined' &&
      crypto.getRandomValues &&
      crypto.getRandomValues.bind(crypto)) ||
    (typeof msCrypto !== 'undefined' &&
      typeof msCrypto.getRandomValues === 'function' &&
      msCrypto.getRandomValues.bind(msCrypto))

  return getRandomValues(rnds8)
}
/* eslint-enable better/no-typeofs,no-undef */

function validate(uuid) {
  const REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i

  // eslint-disable-next-line better/no-typeofs
  return typeof uuid === 'string' && REGEX.test(uuid)
}

const byteToHex = []

// eslint-disable-next-line better/no-fors
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).substr(1))
}

function stringify(arr, offset = 0) {
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  const uuid = `${
    byteToHex[arr[offset + 0]] +
    byteToHex[arr[offset + 1]] +
    byteToHex[arr[offset + 2]] +
    byteToHex[arr[offset + 3]]
  }-${byteToHex[arr[offset + 4]]}${byteToHex[arr[offset + 5]]}-${
    byteToHex[arr[offset + 6]]
  }${byteToHex[arr[offset + 7]]}-${byteToHex[arr[offset + 8]]}${
    byteToHex[arr[offset + 9]]
  }-${byteToHex[arr[offset + 10]]}${byteToHex[arr[offset + 11]]}${
    byteToHex[arr[offset + 12]]
  }${byteToHex[arr[offset + 13]]}${byteToHex[arr[offset + 14]]}${
    byteToHex[arr[offset + 15]]
  }`.toLowerCase()

  // Consistency check for valid UUID.  If this throws, it's likely due to one
  // of the following:
  // - One or more input array values don't map to a hex octet (leading to
  // "undefined" in the uuid)
  // - Invalid input values for the RFC `version` or `variant` fields
  // istanbul ignore next
  if (!validate(uuid)) {
    throw new TypeError('Stringified UUID is invalid')
  }

  return uuid
}

function v4(options = {}) {
  const rnds = options.random || (options.rng || rng)()

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  // eslint-disable-next-line no-bitwise
  rnds[6] = (rnds[6] & 0x0f) | 0x40
  // eslint-disable-next-line no-bitwise
  rnds[8] = (rnds[8] & 0x3f) | 0x80

  return stringify(rnds)
}

export default function createToken() {
  return v4().replace(/-/g, '')
}
