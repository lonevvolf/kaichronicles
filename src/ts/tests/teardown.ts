import * as WebpackDevServer from "webpack-dev-server";

module.exports = async function () {
  const server = <WebpackDevServer>globalThis.__SERVER__;
  console.log('Stopping server...');
  await server.stop();
  console.log('Successfully stopped server');
};