module.exports = function babelConfig(babelApi) {
  const config = {
    plugins: [],
    presets: [],
  }

  if (babelApi.env() === 'test') {
    config.presets.push('@babel/preset-env')
  } else {
    config.plugins.push('babel-plugin-transform-polyfills')
  }

  return config
}
