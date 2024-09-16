const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");
const {InjectManifest} = require('workbox-webpack-plugin');

module.exports = {
  mode: process.env.WEBPACK_ENV ?? 'development',
  entry: './src/ts/index.ts',
  devtool: "source-map",
  performance: {
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },
  ignoreWarnings: [
    {
      message: /InjectManifest has been called multiple times/,
    }
  ],
  devServer: {
    static: './www',
    port: 3000,
    hot: false,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'js/kai.js',
    path: path.resolve(__dirname, 'www'),
    library: 'kai'
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  plugins: [
    new InjectManifest({
      swSrc: '/src/ts/sw.ts',
      swDest: 'sw.js',
      include: [
        /kai\.js$/
      ]
    }),
  ],
  performance: 
  {
    hints: false
  }
};
