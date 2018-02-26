import convertIdsToString from './convertIdsToString'

describe('convertIdsToString', () => {
  it('should return null if the input is null', () => {
    expect(convertIdsToString(null)).toBe(null)
  })

  it('should return undefined if the input is undefined', () => {
    expect(convertIdsToString(undefined)).toBeUndefined()
  })

  it('should return null if the input is null', () => {
    expect(convertIdsToString(null)).toBe(null)
  })

  it('should keep undefined & null values if the key is an id', () => {
    const response = { id: null, other_id: undefined }
    expect(convertIdsToString(response)).toEqual({
      id: null,
      other_id: undefined,
    })
  })

  it('should convert simple ids to string', () => {
    const response = { id: 1 }
    expect(convertIdsToString(response)).toEqual({ id: '1' })
  })

  it('should convert simple fields ending in _id to string', () => {
    const response = { example_id: 1 }
    expect(convertIdsToString(response)).toEqual({ example_id: '1' })
  })

  it('should not touch other values', () => {
    const response = { example_id: 1, something_else: 2 }
    expect(convertIdsToString(response)).toEqual({
      example_id: '1',
      something_else: 2,
    })
  })

  it('should skip conversion of **_id values when it is one of the exceptions', () => {
    const response = { example_id: 1, something_else: 2, external_id: 3 }
    expect(convertIdsToString(response)).toEqual({
      example_id: '1',
      something_else: 2,
      external_id: 3, // This is an exception
    })
  })

  it('should be able to convert ids from objects inside arrays to strings', () => {
    const response = [
      {
        some_object: [{ id: 1 }],
      },
    ]

    expect(convertIdsToString(response)).toEqual([
      {
        some_object: [{ id: '1' }],
      },
    ])
  })

  it('should be able to convert the ids in deeply nested objects to strings', () => {
    const response = {
      some: {
        deeply: {
          nested: {
            id: 123,
            other_id: 456,
            something_else: 789,
          },
        },
      },
    }

    expect(convertIdsToString(response)).toEqual({
      some: {
        deeply: {
          nested: {
            id: '123',
            other_id: '456',
            something_else: 789,
          },
        },
      },
    })
  })
})
