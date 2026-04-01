import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'libs/slider/slider.js',
  output: {
    inlineDynamicImports: true,
    file: 'libs/index.js',
    format: 'es',
  },
  plugins: [resolve(), commonjs()],
  //external: ['@glidejs/glide'],
};
