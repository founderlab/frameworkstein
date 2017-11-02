import _ from 'lodash'
import Queue from 'queue-async'
import path from 'path'
import React from 'react'
import {renderToString} from 'react-dom/server'
import createHistory from 'history/lib/createMemoryHistory'
import {Provider} from 'react-redux'
import {ReduxRouter} from 'redux-router'
import {reduxReactRouter, match} from 'redux-router/server'
import Helmet from 'react-helmet'
import {fetchComponentData} from 'fetch-component-data'
import serialize from 'serialize-javascript'

import {jsAssets, cssAssets} from './assets'

const sendError = (res, err) => {
  console.log(err)
  return res.status(500).send('Error loading initial state')
}

const evalSource = (req, source) => _.isFunction(source) ? source(req) : source || ''

const defaults = {
  entries: ['shared', 'app'],
  webpackAssetsPath: path.resolve(__dirname, '../../../webpack-assets.json'),
}

export default function createServerRenderer(_options) {
  const options = _.extend({}, defaults, _options)
  const {createStore, getRoutes, gaId, config={}} = options
  let alwaysFetch = options.alwaysFetch || []
  if (!_.isArray(alwaysFetch)) alwaysFetch = [alwaysFetch]
  if (!createStore) throw new Error('[fl-react-server] createServerRenderer: Missing createStore from options')
  if (!getRoutes) throw new Error('[fl-react-server] createServerRenderer: Missing getRoutes from options')

  return function app(req, res) {
    const queue = new Queue(1)

    const serverState = {
      auth: req.user ? {user: _.omit(req.user, 'password', '_rev')} : {},
    }
    if (options.loadInitialState) {
      queue.defer(callback => options.loadInitialState(req, (err, state) => {
        if (err) return callback(err)
        callback(null, _.merge(serverState, state))
      }))
    }
    if (_.isFunction(config)) {
      queue.defer(callback => config(req, (err, _config) => {
        if (err) return callback(err)
        callback(null, serverState.config = _config)
      }))
    }
    else {
      serverState.config = config
    }
    queue.await(err => {
      if (err) return sendError(res, err)

      const store = createStore(reduxReactRouter, getRoutes, createHistory, serverState)

      store.dispatch(match(req.originalUrl, (err, redirectLocation, routerState) => {
        if (err) return sendError(res, err)
        if (redirectLocation) {
          const redirectPath = _.isString(redirectLocation) ? redirectLocation : redirectLocation.pathname + (redirectLocation.search || '')
          return res.redirect(redirectPath)
        }
        if (!routerState) return res.status(404).send('Not found')

        const components = _.uniq(alwaysFetch.concat(routerState.components))

        fetchComponentData({store, components}, (err, fetchResult) => {
          if (err) return sendError(res, err)
          if (fetchResult.status) res.status(fetchResult.status)

          let initialState = store.getState()

          // temp solution to rendering admin state
          // todo: make this better. don't include admin reducers / route unless requested
          if (options.omit) initialState = _.omit(initialState, options.omit)

          // https://github.com/rackt/redux-router/issues/106
          routerState.location.query = req.query

          const component = (
            <Provider store={store} key="provider">
              <ReduxRouter />
            </Provider>
          )

          const js = jsAssets(options.entries, options.webpackAssetsPath)
          const scriptTags = js.map(script => `<script type="application/javascript" src="${script}"></script>`).join('\n')

          const css = cssAssets(options.entries, options.webpackAssetsPath)
          const cssTags = css.map(c => `<link rel="stylesheet" type="text/css" href="${c}">`).join('\n')

          const rendered = renderToString(component)
          const head = Helmet.rewind()

          // Google analytics tag
          const gaTag = gaId ? `
            <script>
              (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
              (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
              m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
              })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

              ga('create', '${gaId}', 'auto');
              ga('send', 'pageview');
            </script>` : ''

          const headerTags = evalSource(req, options.headerTags)
          const preScriptTags = evalSource(req, options.preScriptTags)
          const postScriptTags = evalSource(req, options.postScriptTags)

          const html = `
            <!DOCTYPE html>
            <html>
              <head>
                ${head.title}
                ${head.base}
                ${head.meta}
                ${head.link}
                ${head.script}

                ${cssTags}
                ${headerTags}
                <script type="application/javascript">
                  window.__INITIAL_STATE__ = ${serialize(initialState, {isJSON: true})}
                </script>
              </head>
              <body id="app">
                <div id="react-view">${rendered}</div>
                ${preScriptTags}
                ${scriptTags}
                ${gaTag}
                ${postScriptTags}
              </body>
            </html>
          `
          res.type('html').send(html)
        })
      }))
    })
  }
}
