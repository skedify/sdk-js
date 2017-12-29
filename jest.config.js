module.exports = {
  setupFiles: [],
  moduleFileExtensions: ['js'],
  globals: {
    'process.env.NODE_ENV': 'test',
    IS_PRODUCTION: false,
    IS_DEVELOPMENT: false,
    IS_TEST: true,
  },
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.dev.js',
    '!src/util/external/**/*.js',
  ],
  coverageDirectory: './coverage/',
  collectCoverage: false,
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
}
