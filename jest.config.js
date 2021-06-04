module.exports = {
  setupFiles: [],
  moduleFileExtensions: ['js'],
  globals: {
    'process.env.NODE_ENV': 'test',
  },
  testEnvironment: 'jsdom',
  testURL: 'http://localhost',
  transformIgnorePatterns: [
    'node_modules/(?!(babel-plugin-transform-polyfills)/)',
  ],
  collectCoverageFrom: ['src/**/*.js', '!src/**/*.dev.js'],
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
