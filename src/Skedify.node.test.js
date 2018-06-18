/** @jest-environment node */
it('should not add the API to the window.Skedify object if there is no window', () => {
  expect(
    () => require('./build/Skedify.prod') //eslint-disable-line global-require
  ).not.toThrowError()

  expect(
    require('./build/Skedify.prod') //eslint-disable-line global-require
  ).toHaveProperty('API')
})
