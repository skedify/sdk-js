import replace from 'rollup-plugin-replace'

import createConfig from './rollup.config.common'

export default createConfig(common =>
  Object.assign({}, common, {
    input: './src/Skedify.dev.js',
    output: Object.assign({}, common.output, {
      sourcemap: true,
    }),
    plugins: common.plugins.concat([
      replace({
        'process.env.NODE_ENV': JSON.stringify('development'),
        IS_PRODUCTION: JSON.stringify(false),
        IS_DEVELOPMENT: JSON.stringify(true),
        IS_TEST: JSON.stringify(false),
      }),
    ]),
    indent: true,
  })
)
