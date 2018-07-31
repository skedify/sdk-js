import normalizeResponse from './normalizeResponse'
import { createRetryError } from '../../util/createError'

function createResponse(status = 200) {
  return {
    data: {
      data: 'data',
      warnings: 'warnings',
      errors: 'errors',
      meta: 'meta',
    },
    status,
    headers: [],
  }
}

describe('normalizeResponse', () => {
  it('should normalize a successful response', () => {
    expect(normalizeResponse(createResponse())).toMatchSnapshot()
  })

  it('should normalize a failed response and throw it', () => {
    expect.assertions(1)

    try {
      normalizeResponse(
        Object.assign(new Error('something failed'), {
          response: createResponse(),
        })
      )
    } catch (err) {
      expect(err).toMatchSnapshot()
    }
  })

  it('should rethrow an actual a failed network request', () => {
    expect(() =>
      normalizeResponse(new Error('something failed'))
    ).toThrowErrorMatchingSnapshot()
  })

  it('should normalize a failed response after a retry and throw it', () => {
    expect.assertions(1)

    try {
      normalizeResponse(
        Object.assign(createRetryError(`Max retry attempts reached.`), {
          error: Object.assign(new Error('something failed'), {
            response: createResponse(),
          }),
        })
      )
    } catch (err) {
      expect(err).toMatchSnapshot()
    }
  })

  it('should rethrow an actual a failed network request after a retry', () => {
    expect(() =>
      normalizeResponse(
        Object.assign(createRetryError(`Max retry attempts reached.`), {
          error: new Error('something failed'),
        })
      )
    ).toThrowErrorMatchingSnapshot()
  })
})
