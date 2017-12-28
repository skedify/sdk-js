/* eslint-disable no-bitwise */
// props go to https://gist.github.com/jed/982883
// NO COPYRIGHTS INVOLVED

const rand =
  window.crypto === undefined || window.crypto.getRandomValues === undefined
    ? () => Math.random() * 16
    : () => window.crypto.getRandomValues(new Uint8Array(1))[0] % 16 //eslint-disable-line better/no-new

export default function uuid(
  a // placeholder
) {
  return a // if the placeholder was passed, return
    ? // a random number from 0 to 15
      (
        a ^ // unless b is 8,
        (rand() >> // a random number from
          (a / 4))
      ) // 8 to 11
        .toString(16) // in hexadecimal
    : // or otherwise a concatenated string:
      (
        [1e7] + // 10000000 +
        -1e3 + // -1000 +
        -4e3 + // -4000 +
        -8e3 + // -8000 +
        -1e11 + // -100000000000,
        0
      ).replace(
        // replacing
        /[018]/g, // zeroes, ones, and eights with
        uuid // random hex digits
      )
}
