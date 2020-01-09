module.exports = function babelConfig(api) {
  const presets = []
  const plugins = []

  if (api.env('test')) {
    presets.push([
      '@babel/preset-env',
      {
        useBuiltIns: 'usage',
        corejs: 3,
      },
    ])
  } else {
    plugins.push('transform-polyfills')
  }

  return {
    presets,
    plugins,
  }
}
