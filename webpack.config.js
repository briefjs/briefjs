const path = require('path');
const fs = require('fs');

module.exports = function (env = {}) {
  const outputPath = path.resolve(__dirname, env.outputPath || 'dist');

  const output = {
    path: outputPath,
    filename: env.production ? 'brief.min.js' : 'brief.js',
    publicPath: '/js/',
    library: 'briefjs',
    libraryTarget: 'umd',
  };

  let babelConf;
  const babelRC = './.babelrc';
  if(fs.existsSync(babelRC)) {
    babelConf = JSON.parse(fs.readFileSync(babelRC));
    babelConf.babelrc = false;
  }

  return {
    mode: env.production ? 'production' : 'none',
    entry: './src/index',
    output,

    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules\/(?!(@briefjs\/[\w-]+)\/).*/,
          use: {
            loader: 'babel-loader',
            options: babelConf,
          },
        },
      ],

      /* Advanced module configuration (click to show) */
    },
    // Don't follow/bundle these modules, but request them at runtime from the environment

    stats: 'errors-only',
    // lets you precisely control what bundle information gets displayed

    devServer: {
      contentBase: path.join(__dirname, env.server || 'example'),
      disableHostCheck: true,
      compress: true,
      port: 9090,
      // ...
    },

    plugins: [
      // ...
    ],
    // list of additional plugins


    /* Advanced configuration (click to show) */
  };
};
