var Express = require('express')
var webpack = require('webpack')
var Dashboard = require('webpack-dashboard')
var DashboardPlugin = require('webpack-dashboard/plugin')

var webpackConfig = require('./dev.config')
var compiler = webpack(webpackConfig)

var host = process.env.HOSTNAME || 'localhost'
var port = (parseInt(process.env.PORT) + 1) || 3001
var serverOptions = {
  contentBase: 'http://' + host + ':' + port,
  quiet: true,
  noInfo: true,
  hot: true,
  inline: true,
  lazy: false,
  publicPath: webpackConfig.output.publicPath,
  headers: {'Access-Control-Allow-Origin': '*'},
  stats: 'none',
  logLevel: 'error',
  // lazy: true,
  watchOptions: {
    aggregateTimeout: 3000,
  }
}

var dashboard = new Dashboard()
compiler.apply(new DashboardPlugin(dashboard.setData))

var app = new Express()

app.use(require('webpack-dev-middleware')(compiler, serverOptions))
app.use(require('webpack-hot-middleware')(compiler, {log: function() { return null }}))

app.listen(port, function onAppListening(err) {
  if (err) {
    console.error(err)
  }
  else {
    console.info('==> 🚧  Webpack development server listening on port %s', port)
  }
})
