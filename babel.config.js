module.exports = function babelConfig(api) {
  const presets = []
  const plugins = ['transform-polyfills']

  if (api.env('test')) {
    presets.push('@babel/preset-env')
  }

  return {
    presets,
    plugins,
  }
}
