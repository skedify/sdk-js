import alias from '@rollup/plugin-alias'
import buble from '@rollup/plugin-buble'
import commonjs from '@rollup/plugin-commonjs'
import inject from '@rollup/plugin-inject'
import resolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'

import PACKAGE from './package.json'

export function createUMDConfig(merger) {
  return merger({
    output: {
      exports: 'named',
      banner: `/* Copyright ${new Date().getUTCFullYear()} Skedify NV */`,

      format: 'umd',
      name: 'Skedify',
      file: PACKAGE.main,

      globals: {
        crypto: 'crypto',
      },
    },
    external: ['crypto'],
    plugins: [
      alias({
        resolve: ['.js', ''],
      }),
      resolve({
        mainFields: ['module', 'jsnext', 'main', 'browser'],
        browser: true,
        extensions: ['.js', '/index.js'],
        preferBuiltins: false,
      }),
      commonjs(),
      babel({
        include: ['node_modules/axios/**', 'src/**'],
        babelHelpers: 'bundled',
      }),
      buble({
        namedFunctionExpressions: false,
        objectAssign: 'Object.assign',
      }),
      inject({
        include: '**/*.js',
        exclude: 'node_modules/**',
      }),
    ],
  })
}
