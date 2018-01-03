import joinAsSpeech, { AND, OR } from './joinAsSpeech'

describe('joinAsSpeech', () => {
  describe('OR', () => {
    it('should return undefined if there is no list', () => {
      expect(joinAsSpeech(OR)).toBeUndefined()
    })

    it('should return undefined if there is an empty list', () => {
      expect(joinAsSpeech(OR, [])).toBeUndefined()
    })

    it('should be able to join a single word', () => {
      expect(joinAsSpeech(OR, ['Foo'])).toEqual('Foo')
    })

    it('should be able to join two words', () => {
      expect(joinAsSpeech(OR, ['Foo', 'Bar'])).toEqual('Foo or Bar')
    })

    it('should be able to join multiple words', () => {
      expect(joinAsSpeech(OR, ['Foo', 'Bar', 'Baz', 'Buz'])).toEqual(
        'Foo, Bar, Baz or Buz'
      )
    })
  })

  describe('AND', () => {
    it('should be able to join a single word', () => {
      expect(joinAsSpeech(AND, ['Foo'])).toEqual('Foo')
    })

    it('should be able to join two words', () => {
      expect(joinAsSpeech(AND, ['Foo', 'Bar'])).toEqual('Foo and Bar')
    })

    it('should be able to join multiple words', () => {
      expect(joinAsSpeech(AND, ['Foo', 'Bar', 'Baz', 'Buz'])).toEqual(
        'Foo, Bar, Baz and Buz'
      )
    })
  })
})
