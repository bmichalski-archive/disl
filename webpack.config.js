const webpack = require('webpack')

const env = (undefined === process.env.NODE_ENV) ? 'production' : process.env.NODE_ENV

const filename = 'production' === env ? 'di.min.js' : 'di-dev.js'
const devtool = 'production' === env ? false: 'inline-source-map'
const plugins = []
let uglifyConfig

if ('production' === env) {
  uglifyConfig = {}
  plugins.push(new webpack.optimize.UglifyJsPlugin(uglifyConfig))
} else {
  uglifyConfig = {}
}

module.exports = {
  devtool: devtool,
  entry: './index.js',
  output: {
    path: './built',
    filename: filename,
    libraryTarget: 'umd'
  },
  plugins: plugins,
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  }
}