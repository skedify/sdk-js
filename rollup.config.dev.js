import replace from 'rollup-plugin-replace'

import common from './rollup.config.common'

export default Object.assign({}, common, {
  entry: './src/Skedify.dev.js',
  plugins: common.plugins.concat([
    replace({
      ENVIRONMENT: JSON.stringify('development'),
    }),
  ]),
  sourceMap: true,
  indent: true,
})
