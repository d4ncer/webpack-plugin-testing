const webpack = require('webpack');
const path = require('path');

function DependencyGraphPlugin(options) {}

DependencyGraphPlugin.prototype.apply = function(compiler) {
  const lines = [
    'digraph G {'
  ];
  compiler.plugin('after-compile', function(compilation, callback) {
    compilation.modules.forEach((m) => {
      m.dependencies.filter(d => d.module !== null).forEach((d) => {
        lines.push(`"${m.rawRequest}" -> "${d.module.rawRequest}"`);
      });
    });
    lines.push("}");
    callback();
  });
  compiler.plugin('emit', function(compilation, callback) {
    const contents = lines.join('\n');
    compilation.assets['deps-graph.dot'] = {
      source: function() {
        return contents;
      },
      size: function() {
        return contents.length;
      }
    };
    callback();
  });
};

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
    new DependencyGraphPlugin(),
  ]
};
