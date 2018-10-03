import replace from 'rollup-plugin-replace'
import { terser } from 'rollup-plugin-terser'

import { createUMDConfig } from './rollup.config.common'

const createBaseConfig = common => specific => {
  const base = Object.assign({}, common, specific)
  const sourcemap = false

  return Object.assign({}, base, {
    output: Object.assign({}, base.output, {
      sourcemap,
      indent: false,
    }),
    plugins: base.plugins.concat([
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      terser({
        sourcemap,
        output: {
          comments: function(node, comment) {
            return comment.type === 'comment2' && /Copyright/i.test(comment.value)
          },
        },
      })
    ]),
  })
}

export default createUMDConfig(
  createBaseConfig({ input: './src/build/Skedify.prod' })
)
