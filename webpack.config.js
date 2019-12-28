const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  module: {
  },
  resolve: {
    extensions: ['.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new CopyPlugin([
      { from: './public', to: './' },
    ]),
    new ZipPlugin({
      path: '../',
      filename: 'social-network-volume-fix.zip'
    })
  ],
  mode: 'production'
};
