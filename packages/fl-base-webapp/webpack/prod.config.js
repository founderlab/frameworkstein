require('babel-polyfill')

// Webpack config for creating the production bundle.

const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const AssetsPlugin = require('assets-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const relativeAssetsPath = '../public/dist'
const assetsPath = path.join(__dirname, relativeAssetsPath)

module.exports = {
  context: path.resolve(__dirname, '..'),
  entry: {
    app: [
      'bootstrap-loader/extractStyles',
      'font-awesome-webpack!./webpack/fontAwesome/font-awesome.config.js',
      './client/app.js',
    ],
    admin: [
      'bootstrap-loader/extractStyles',
      'font-awesome-webpack!./webpack/fontAwesome/font-awesome.config.js',
      './client/admin.js',
    ],
  },
  output: {
    path: assetsPath,
    filename: '[name]-[chunkhash].js',
    chunkFilename: '[name]-[chunkhash].js',
    publicPath: '/public/dist/',
  },
  module: {
    rules: [
      // turn off AMD when loading backbone
      {
        test: /backbone\.js$/,
        use: 'imports-loader?define=>false',
      },

      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: ['babel-loader'],
      },

      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
            },
            'autoprefixer-loader',
            'sass-loader',
          ],
        }),
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
            },
            'autoprefixer-loader',
          ],
        }),
      },

      {test: /\.(png|jpg|gif|wav|mp3)$/, use: 'file-loader'},

      {test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, use: 'url-loader?limit=10000&mimetype=application/font-woff'},
      {test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, use: 'url-loader?limit=10000&mimetype=application/font-woff'},
      {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, use: 'url-loader?limit=10000&mimetype=application/octet-stream'},
      {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader'},
      {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, use: 'url-loader?limit=10000&mimetype=image/svg+xml'},
    ],
  },
  resolve: {
    modules: [
      'node_modules',
    ],
  },
  plugins: [
    new AssetsPlugin({prettyPrint: true}),

    // css files from the extract-text-plugin loader
    new ExtractTextPlugin('[name]-[chunkhash].css', {allChunks: true}),

    // set global vars
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),

    // ignore jquery (used by backbone)
    new webpack.IgnorePlugin(/^jquery$/),
    new webpack.IgnorePlugin(/^bootstrap-sass$/),

    // optimizations
    new webpack.optimize.CommonsChunkPlugin({name: 'shared', filename: 'shared-[chunkhash].js'}),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new UglifyJsPlugin({
      parallel: true,
      uglifyOptions: {
        // mangle: false,
        inline: false,
        mangle: {
          keep_fnames: true,
        },
        compress: {
          arrows: false,
          booleans: false,
          collapse_vars: false,
          comparisons: false,
          computed_props: false,
          hoist_funs: false,
          hoist_props: false,
          hoist_vars: false,
          if_return: false,
          inline: false,
          join_vars: false,
          keep_infinity: true,
          loops: false,
          negate_iife: false,
          properties: false,
          reduce_funcs: false,
          reduce_vars: false,
          sequences: false,
          side_effects: false,
          switches: false,
          top_retain: false,
          toplevel: false,
          typeofs: false,
          unused: false,

          // Switch off all types of compression except those needed to convince
          // react-devtools that we're using a production build
          conditionals: true,
          dead_code: true,
          evaluate: true,
        },
        output: {
          comments: false,
        },
        exclude: [/\.min\.js$/gi], // skip pre-minified libs
      },
    }),
  ],
}
