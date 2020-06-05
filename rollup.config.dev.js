import replace from 'rollup-plugin-replace'

import { createUMDConfig } from './rollup.config.common'

const createBaseConfig = (common) => (specific) => {
  const base = Object.assign({}, common, specific)

  return Object.assign({}, base, {
    output: Object.assign({}, base.output, {
      sourcemap: true,
      indent: true,
    }),
    plugins: base.plugins.concat([
      replace({
        'process.env.NODE_ENV': JSON.stringify('development'),
      }),
    ]),
  })
}

export default createUMDConfig(
  createBaseConfig({ input: './src/build/Skedify.dev' })
)
