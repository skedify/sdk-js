import alias from 'rollup-plugin-alias'
import buble from 'rollup-plugin-buble'
import commonjs from 'rollup-plugin-commonjs'
import inject from 'rollup-plugin-inject'
import replace from 'rollup-plugin-replace'
import resolve from 'rollup-plugin-node-resolve'

import PACKAGE from './package.json'

export default {
  format: 'iife',
  exports: 'default',
  moduleName: 'Skedify',
  dest: `./lib/${ PACKAGE.name }.js`,
  plugins: [
    alias({
      resolve: ['.js', '.jsx', '.css', ''],
    }),
    resolve({
      jsnext: true,
      main: true,
      browser: true,
      extensions: [
        '.js', '.jsx', '.css',
        '/index.js', '/index.jsx', '/index.css',
      ],
    }),
    commonjs({
      namedExports: {
        'node_modules/fecha/fecha.js': ['parse', 'format'],
      },
    }),
    buble({
      namedFunctionExpressions: false,
      objectAssign: 'Object.assign',
      jsx: 'jsx',
    }),
    inject({
      include: '**/*.jsx?',
      exclude: 'node_modules/**',
      modules: {
        jsx: ['preact', 'h'],
        Component: ['preact', 'Component'],
      },
    }),
    replace({
      PACKAGE: JSON.stringify(PACKAGE.name),
      VERSION: JSON.stringify(PACKAGE.version),
    }),
  ],
  banner: `/* Copyright ${ (new Date()).getUTCFullYear() } Skedify NV */`,
}
