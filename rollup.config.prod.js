import uglify from 'rollup-plugin-uglify'
import { minify } from 'uglify-es'
import replace from 'rollup-plugin-replace'

import createConfig from './rollup.config.common'

import testUtilsBuild from './rollup.config.test-utils'

const productionBuild = createConfig(common =>
  Object.assign({}, common, {
    input: './src/Skedify.js',
    output: Object.assign({}, common.output, {
      sourcemap: false,
      indent: false,
    }),
    plugins: common.plugins.concat([
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        IS_PRODUCTION: JSON.stringify(true),
        IS_DEVELOPMENT: JSON.stringify(false),
        IS_TEST: JSON.stringify(false),
      }),
      uglify(
        {
          output: {
            comments(node, comment) {
              return (
                comment.type === 'comment2' && /Copyright/i.test(comment.value)
              )
            },
          },
        },
        minify
      ),
    ]),
  })
)

export default [].concat(productionBuild, testUtilsBuild)
