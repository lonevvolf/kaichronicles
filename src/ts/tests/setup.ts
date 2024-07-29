import * as Webpack from "webpack";
import * as WebpackDevServer from "webpack-dev-server";
import * as webpackConfig from "../../../webpack.config.js";


module.exports = async function () {
  const compiler = Webpack(webpackConfig);
  const devServerOptions = { ...webpackConfig.devServer, open: false };
  devServerOptions.port = 3001;
  const server = new WebpackDevServer(devServerOptions, compiler);

  globalThis.__SERVER__ = server;
  console.log('Starting server...');
  await server.start();
  console.log('Successfully started server');
};