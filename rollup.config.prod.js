import uglify from 'rollup-plugin-uglify'
import { minify } from 'uglify-es'
import replace from 'rollup-plugin-replace'

import { createUMDConfig } from './rollup.config.common'

const createBaseConfig = common => specific => {
  const base = Object.assign({}, common, specific)

  return Object.assign({}, base, {
    output: Object.assign({}, base.output, {
      sourcemap: false,
      indent: false,
    }),
    plugins: base.plugins.concat([
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
}

export default createUMDConfig(
  createBaseConfig({ input: './src/build/Skedify.prod' })
)
