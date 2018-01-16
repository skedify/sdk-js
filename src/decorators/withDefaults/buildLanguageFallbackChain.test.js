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
})
