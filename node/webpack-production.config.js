// Doc version: 2020-10-11

const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  entry: "./src/index.ts",

  mode: "production",
  target: "node",
  plugins: [

    new CleanWebpackPlugin()

  ],

  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "umd",
    library: "LibraryNameToMakePublic"
  },

  externals: [nodeExternals()],

  module: {
    rules: [{
      test: /\.tsx?$/,
      use: "ts-loader",
      exclude: [

        path.join(__dirname, "/node_modules/"),
        path.join(__dirname, "/src/test/")

      ]
    }]
  },

  optimization: {

    minimize: true,
    minimizer: [new TerserPlugin({
      parallel: true,
      terserOptions: {
        extractComments: true,
        mangle: {
          toplevel: true
        },
        output: {
          comments: false
        }
      }
    })]

  },

  node: {
    fs: "empty"
  },

  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  }

};
