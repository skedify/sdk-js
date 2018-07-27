import retry from './retry'

describe('retry', () => {
  it('should not try to retry when everything is ok', async () => {
    expect(
      await retry(resolve => {
        resolve('ALL GOOD')
      })
    ).toEqual('ALL GOOD')
  })

  it('should retry the same function and resolve after a few retries', async () => {
    const mock = jest.fn()
    let count = 0

    expect(
      await retry(
        (resolve, reject) => {
          mock()

          if (++count === 2) {
            resolve('good')
          } else {
            reject()
          }
        },
        { delay_time: 0 }
      )
    ).toEqual('good')

    expect(mock).toHaveBeenCalledTimes(2)
  })

  it('should retry the same function but stop when it has reached max attempts', async () => {
    const mock = jest.fn()
    const error = new Error('some error')

    expect.assertions(3)

    try {
      await retry(
        (resolve, reject) => {
          mock()
          reject(error)
        },
        { delay_time: 0 }
      )
    } catch (err) {
      expect(err).toMatchSnapshot()
      expect(err.error).toBe(error) // Make sure an error property is available
    }

    expect(mock).toHaveBeenCalledTimes(3)
  })

  it('should retry the same function but stop when it has reached max attempts', async () => {
    const mock = jest.fn()
    expect.assertions(3)

    try {
      await retry(
        (resolve, reject) => {
          mock()
          reject()
        },
        { delay_time: 0 }
      )
    } catch (err) {
      expect(err).toMatchSnapshot()
      expect(err.error).toBe(undefined)
    }

    expect(mock).toHaveBeenCalledTimes(3)
  })

  it('should be possible to change the max attempts value', async () => {
    const mock = jest.fn()
    let count = 0

    expect(
      await retry(
        (resolve, reject) => {
          mock()

          if (++count === 5) {
            resolve('good')
          } else {
            reject()
          }
        },
        { max_attempts: 10, delay_time: 0 }
      )
    ).toEqual('good')

    expect(mock).toHaveBeenCalledTimes(5)
  })

  it('should throw an error when a passed condition is true even though the retry is rejected', async () => {
    await expect(
      retry(
        (resolve, reject) => {
          reject(new Error('Still rejected'))
        },
        { delay_time: 0, condition: () => false }
      )
    ).rejects.toThrowErrorMatchingSnapshot()
  })
})
