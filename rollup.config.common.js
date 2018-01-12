import alias from 'rollup-plugin-alias'
import buble from 'rollup-plugin-buble'
import commonjs from 'rollup-plugin-commonjs'
import inject from 'rollup-plugin-inject'
import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'

import PACKAGE from './package.json'

const defaultConfig = {
  output: {
    exports: 'default',
    banner: `/* Copyright ${new Date().getUTCFullYear()} Skedify NV */`,
  },
  plugins: [
    alias({
      resolve: ['.js', ''],
    }),
    resolve({
      module: true,
      jsnext: true,
      main: true,
      browser: true,
      extensions: ['.js', '/index.js'],
      preferBuiltins: false,
    }),
    commonjs({
      namedExports: {},
    }),
    babel({
      exclude: ['node_modules/**'],
      runtimeHelpers: true,
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
}

function createConfig(merger) {
  return [
    {
      output: {
        format: 'umd',
        name: 'Skedify',
        file: PACKAGE.main,
      },
    },
    {
      output: {
        format: 'es',
        name: 'Skedify',
        file: PACKAGE.module,
      },
    },
  ].map(config => merger(Object.assign({}, defaultConfig, config)))
}

export default createConfig
