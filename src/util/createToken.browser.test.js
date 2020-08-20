describe('createToken', () => {
  beforeAll(() => {
    // I know we "fake" the browser implementation, however this way
    // we are still testing the browser detection itself.
    global.crypto = {
      randomFillSync: crypto.randomFillSync,
      getRandomValues: (buffer) => crypto.randomFillSync(buffer),
    }
  })

  afterAll(() => {
    // Remove our fake implementation again
    //eslint-disable-next-line better/no-deletes
    delete global.crypto.getRandomValues
  })

  it('should generate a random string', () => {
    // We are only importing it now because otherwise our `getRandomValues` implementation
    // won't get pucked up correctly.
    // It's not super clean but it works for now.
    const createToken = require('./createToken').default //eslint-disable-line global-require

    expect(createToken()).toBeDefined()
  })

  it('should remove all dashes from the uuid', () => {
    // We are only importing it now because otherwise our `getRandomValues` implementation
    // won't get pucked up correctly.
    // It's not super clean but it works for now.
    const createToken = require('./createToken').default //eslint-disable-line global-require

    expect(createToken()).not.toContain('-')
  })
})
