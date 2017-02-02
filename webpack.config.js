const webpack = require('webpack');
const path = require('path');
const DependencyGraphPlugin = require('./plugins/dependency-graph-plugin');

module.exports = {
  context: path.resolve(__dirname, './src'),
  entry: {
    app: './index.js',
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].bundle.js',
  },
  plugins: [
    new DependencyGraphPlugin({
      output: "deps-graph.dot",
      postBuildCommand: "dot -Tpdf < deps-graph.dot > deps-graph.pdf"
    }),
  ]
};
