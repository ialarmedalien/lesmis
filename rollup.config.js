import resolve from 'rollup-plugin-node-resolve';
import buble from 'rollup-plugin-buble';
import json from 'rollup-plugin-json'
// import babelrc from 'babelrc-rollup';
// import commonjs from 'rollup-plugin-commonjs';

// import uglify from 'rollup-plugin-uglify';
// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/main.js',
  output: {
    file: 'js/lesmis.js',
    name: 'lesmis_iife',
    format: 'iife', // immediately-invoked function expression — suitable for <script> tags
    sourcemap: true,
    globals: {
      d3: 'd3',
      KeyLines: 'KeyLines'
    }
  },
  plugins: [
    json({
      include: 'data/**',
      exclude: [ 'node_modules/**' ],
//      indent: '  ',
      compact: true
    }),
    buble(),
    resolve(), // tells Rollup how to find date-fns in node_modules
//    commonjs(), // converts date-fns to ES modules
//    production && uglify() // minify, but only in production
  ],
  external: ['d3', 'KeyLines']
};