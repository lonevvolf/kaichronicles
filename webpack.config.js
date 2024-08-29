const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");
const {InjectManifest} = require('workbox-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/ts/index.ts',
  devtool: "source-map",
  devServer: {
    static: './www',
    port: 3000,
    hot: false,
    client: {
      overlay: {
        // This is a terrible workaround for the annoying message from Workbox, but other solutions to suppress it have not yet worked
        warnings: (warning) => {
          if (warning.message.startsWith('InjectManifest has been called multiple times')) {
            return false;
          }
          return true;
        },
      }
    }
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
  },
  plugins: [
    new InjectManifest({
      swSrc: '/src/ts/sw.ts',
      swDest: '../sw.js',
      include: [
        /kai\.js$/
      ]
    }),
  ]
};
