const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: 'development',
  entry: './src/ts/index.ts',
  devtool: "source-map",
  devServer: {
    static: './www',
    port: 3000,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'kai.js',
    path: path.resolve(__dirname, 'www/js'),
    publicPath: '/js/',
    library: 'kai'
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  }
};
