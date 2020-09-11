var path = require("path");
var webpack = require("webpack");

var PATHS = {
  entryPoint: './src/index.ts',
  bundles: path.resolve(__dirname, 'builds/bundle'),
}

var config = {
  mode: 'production',
  devtool: 'source-map',
  entry: {
    'filecoin': [PATHS.entryPoint],
    'filecoin.min': [PATHS.entryPoint]
  },
  output: {
    path: PATHS.bundles,
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'FilecoinJs',
    umdNamedDefine: true
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  // Activate source maps for the bundles in order to preserve the original
  // source when the user debugs the application
  module: {
    rules: [
      {
        test: /\.ts?$/,
        loader: 'ts-loader',
        exclude: /(node_modules|__tests__)/,
      },
    ],
  }
}

module.exports = config;
