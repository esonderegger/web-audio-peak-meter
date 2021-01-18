const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const serve = require('rollup-plugin-serve');
const terser = require('rollup-plugin-terser');

module.exports = {
  input: 'src/index.js',
  output: {
    file: 'docs/web-audio-peak-meter-2.0.0.min.js',
    format: 'iife',
    name: 'webAudioPeakMeter',
    exports: 'named',
  },
  plugins: [
    resolve({ jsnext: true, main: true }),
    commonjs(),
    terser.terser(),
    serve({ port: 6080, contentBase: 'docs' }),
  ],
};
