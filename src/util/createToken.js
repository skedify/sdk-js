/**
 * The issue with the UUID package we used before is that it supports EITHER
 * the browser OR NodeJS, but not both at the same time.
 * This is an issue because we use the SDK in both the Browser & NodeJS.
 *
 * In rollup.config.common.js you can see that we build for the browser (node-resolve rollup plugin)
 * Because of that the UUID package would be broken in our NodeJS packages.
 *
 * Interesting: There is also a proposal to make UUID a standard in JavaScript: https://github.com/tc39/proposal-uuid
 * Might be something we can use in the future if it actually becomes a thing!
 *
 * Using the built-in Crypto module isn't straight-forward, since its support between
 * environments (Browser, NodeJS, JSDom) isn't very streamlined.
 * Since we only use these tokens for constants at the moment a simple
 * Math.random will work fine.
 */

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0, // eslint-disable-line no-bitwise
      v = c == 'x' ? r : (r & 0x3) | 0x8 // eslint-disable-line no-bitwise
    return v.toString(16)
  })
}

export default function createToken() {
  return uuidv4().replace(/-/g, '')
}
