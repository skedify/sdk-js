import buildLanguageFallbackChain from './buildLanguageFallbackChain'

describe('buildLanguageFallbackChain', () => {
  it('should be able to parse simple language strings', () => {
    expect(buildLanguageFallbackChain('nl')).toEqual(['nl'])
  })

  it('should be able to parse languages with country code', () => {
    expect(buildLanguageFallbackChain('nl-be')).toEqual(['nl-be', 'nl'])
  })

  it('should be able to parse languages with country and city code', () => {
    expect(buildLanguageFallbackChain('nl-be-wvl')).toEqual([
      'nl-be-wvl',
      'nl-be',
      'nl',
    ])
  })

  describe('locale as an array', () => {
    it('should be able to parse simple language strings', () => {
      expect(buildLanguageFallbackChain(['nl'])).toEqual(['nl'])
      expect(buildLanguageFallbackChain(['nl', 'en'])).toEqual(['nl', 'en'])
    })

    it('should be able to parse languages with country code', () => {
      expect(buildLanguageFallbackChain(['nl-be'])).toEqual(['nl-be', 'nl'])
      expect(buildLanguageFallbackChain(['nl-be', 'en-us'])).toEqual([
        'nl-be',
        'nl',
        'en-us',
        'en',
      ])
    })

    it('should be able to parse languages with country and city code', () => {
      expect(buildLanguageFallbackChain(['nl-be-wvl'])).toEqual([
        'nl-be-wvl',
        'nl-be',
        'nl',
      ])
      expect(buildLanguageFallbackChain(['nl-be-wvl', 'en-us-abc'])).toEqual([
        'nl-be-wvl',
        'nl-be',
        'nl',
        'en-us-abc',
        'en-us',
        'en',
      ])
    })
  })
})
