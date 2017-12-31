import createError from './createError'

describe('createError', () => {
  it('should be able to create an error', () => {
    const error = createError('Some Error')

    expect(error).toBeInstanceOf(Error)
    expect(error.message).toEqual('Some Error')

    expect(error.internal_stack).toBeDefined()
  })

  it('should be able to create an error with a type', () => {
    const error = createError('Some Error', 'MISCONFIGURED')

    expect(error).toBeInstanceOf(Error)

    expect(error.message).toEqual('Some Error')

    expect(error).toHaveProperty('type')
    expect(error.type).toEqual('MISCONFIGURED')
  })

  it('should be able to create an error with a type and a subtype', () => {
    const error = createError(
      'Some Error',
      'MISCONFIGURED',
      'MISCONFIGURED_CLIENT_ID'
    )

    expect(error).toBeInstanceOf(Error)

    expect(error.message).toEqual('Some Error')

    expect(error).toHaveProperty('type')
    expect(error).toHaveProperty('subtype')

    expect(error.type).toEqual('MISCONFIGURED')
    expect(error.subtype).toEqual('MISCONFIGURED_CLIENT_ID')
  })

  it('should be possible to create an error with a namespace', () => {
    const createNamespacedError = createError.withNamespace('Namespace')
    const error = createNamespacedError('Some Error')

    expect(error).toBeInstanceOf(Error)
    expect(error.message).toEqual('[NAMESPACE]: Some Error')

    expect(error.internal_stack).toBeDefined()
  })
})
