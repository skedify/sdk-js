import uglify from 'rollup-plugin-uglify'
import { minify } from 'uglify-es'
import alias from 'rollup-plugin-alias'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import buble from 'rollup-plugin-buble'

import PACKAGE from './package.json'

export default [
  {
    input: './src/Skedify.testing.js',
    output: {
      banner: `/* Copyright ${new Date().getUTCFullYear()} Skedify NV */`,
      format: 'cjs',
      name: 'Skedify',
      file: 'lib/test-utils.js',
      sourcemap: true,
      indent: true,
    },
    external: Object.keys(PACKAGE.dependencies),
    plugins: [
      alias({
        resolve: ['.js', ''],
      }),
      resolve({
        module: false,
        jsnext: true,
        main: true,
        browser: false,
        extensions: ['.js', '/index.js'],
        preferBuiltins: false,
      }),
      commonjs({
        namedExports: {},
      }),
      buble({
        namedFunctionExpressions: false,
        objectAssign: 'Object.assign',
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
    ],
  },
]
