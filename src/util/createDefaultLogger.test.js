const { createDefaultLogger } = require('./createDefaultLogger')

it('should contain all required methods', () => {
  const logger = createDefaultLogger()

  expect(logger).toHaveProperty('trace')
  expect(logger.trace()).toBe(undefined)

  expect(logger).toHaveProperty('debug')
  expect(logger.debug()).toBe(undefined)

  expect(logger).toHaveProperty('info')
  expect(logger.info()).toBe(undefined)

  expect(logger).toHaveProperty('warn')
  expect(logger.warn()).toBe(undefined)

  expect(logger).toHaveProperty('error')
  expect(logger.error()).toBe(undefined)

  expect(logger).toHaveProperty('fatal')
  expect(logger.fatal()).toBe(undefined)
})
