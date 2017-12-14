import uglify from 'rollup-plugin-uglify'
import replace from 'rollup-plugin-replace'

import common from './rollup.config.common'

export default Object.assign({}, common, {
  entry: './src/Skedify.js',
  plugins: common.plugins.concat([
    replace({
      ENVIRONMENT: JSON.stringify('production'),
    }),
    uglify({
      output: {
        comments(node, comment) {
          return comment.type === 'comment2' && /Copyright/i.test(comment.value)
        },
      },
    }),
  ]),
  sourceMap: false,
  indent: false,
})
