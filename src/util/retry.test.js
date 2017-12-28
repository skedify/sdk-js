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
        { delay_time: 2 }
      )
    ).toEqual('good')

    expect(mock).toHaveBeenCalledTimes(2)
  })

  it('should retry the same function but stop when it has reached max attempts', async () => {
    const mock = jest.fn()

    await expect(
      retry((resolve, reject) => {
        mock()
        reject()
      })
    ).rejects.toThrowErrorMatchingSnapshot()

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
        { max_attempts: 10, delay_time: 2 }
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
        { delay_time: 2, condition: () => false }
      )
    ).rejects.toThrowErrorMatchingSnapshot()
  })
})
