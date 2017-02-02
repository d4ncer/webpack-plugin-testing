const webpack = require('webpack');
const path = require('path');
const exec = require('child_process').exec;

function DependencyGraphPlugin(options) {
  this.options = options;
}

DependencyGraphPlugin.prototype.apply = function(compiler) {
  const plugin = this;
  const lines = [];
  compiler.plugin('after-compile', function(compilation, callback) {
    lines.push('digraph G {');
    compilation.modules.forEach((m) => {
      m.dependencies.filter(d => d.module !== null).forEach((d) => {
        lines.push(`"${m.rawRequest}" -> "${d.module.rawRequest}";`);
      });
    });
    lines.push("}");
    callback();
  });
  compiler.plugin('emit', function(compilation, callback) {
    const contents = lines.join('\n');
    lines.splice(0);
    compilation.assets[plugin.options.output || 'deps-graph.dot'] = {
      source: function() {
        return contents;
      },
      size: function() {
        return contents.length;
      }
    };
    callback();
  });
  compiler.plugin('after-emit', function(compilation, callback) {
    if (plugin.options.postBuildCommand) {
      exec(plugin.options.postBuildCommand, { cwd: this.options.output.path }, (err) => {
        if (err) {
          console.error(err);
        }
        callback();
      });
    }
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
    new DependencyGraphPlugin({
      output: "deps-graph.dot",
      postBuildCommand: "dot -Tpdf < deps-graph.dot > deps-graph.pdf"
    }),
  ]
};
