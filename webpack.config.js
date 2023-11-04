const path = require("path");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const ZipPlugin = require("zip-webpack-plugin");

module.exports = (env) => ({
  entry: {
    content: "./src/content.ts",
    popup: "./src/popup.ts",
    background: "./src/background.ts",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "[name]/[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new webpack.DefinePlugin({
      DEBUG: JSON.stringify(env && env.DEBUG),
    }),
    new CopyPlugin({
      patterns: [{ from: "./public", to: "./" }],
    }),
    new ZipPlugin({
      path: "../",
      filename: "social-network-volume-fix.zip",
    }),
  ],
  mode: "production",
});
