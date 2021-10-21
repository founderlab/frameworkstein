import _ from 'lodash'
import path from 'path'
import qs from 'qs'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { Provider } from 'react-redux'
import Helmet from 'react-helmet'
import { createMemoryHistory } from 'history'
import { ConnectedRouter } from 'connected-react-router'
import { matchRoutes, renderRoutes } from 'react-router-config'
import { fetchComponentData } from 'fetch-component-data'
import serialize from 'serialize-javascript'
import { ChunkExtractor } from '@loadable/server'
import { jsAssets, cssAssets } from './assets'


const sendTextError = (res, err) => {
  return res.status(500).send('Error loading initial state')
}

const sendTextNotFound = res => {
  return res.status(404).send('404 not found')
}

const evalSource = (req, source) => _.isFunction(source) ? source(req) : source || ''

const defaults = {
  lang: 'en',
  entries: ['shared', 'app'],
  webpackAssetsPath: path.resolve(__dirname, '../../../webpack-assets.json'),
  loadableStatsPath: './public/dist/loadable-stats.json',
}

async function checkRedirect({ req, store, branch }) {
  let redirectUrl

  branch.forEach(branch => {
    const { route } = branch
    branch.location = branch.location || {pathname: req.path, query: req.query}
    if (route.authenticate && !route.authenticate(store.getState(), branch)) {
      redirectUrl = route.redirectUrl ? route.redirectUrl(req.originalUrl) : '/'
    }
    if ((_.isFunction(route.shouldRedirect) && route.shouldRedirect(store.getState(), branch)) || route.shouldRedirect) {
      redirectUrl = route.redirectUrl ? route.redirectUrl(req.originalUrl) : '/'
    }
    if (_.isFunction(route.onEnter)) {
      const onEnterResult = route.onEnter(store.getState(), branch) || {}
      if (onEnterResult.redirectUrl) redirectUrl = onEnterResult.redirectUrl
    }
  })

  return redirectUrl
}

function extractAssets(options) {
  const assets = {}
  if (options.enableLoadable) {
    const statsFile = path.resolve(options.loadableStatsPath)
    const extractor = new ChunkExtractor({statsFile, entrypoints: options.entries})
    assets.extractor = extractor
    assets.scriptTags = extractor.getScriptTags()
    assets.linkTags = extractor.getLinkTags()
    assets.styleTags = extractor.getStyleTags()
  }
  else {
    const js = jsAssets(options.entries, options.webpackAssetsPath)
    assets.scriptTags = js.map(script => `<script type="application/javascript" src="${script}"></script>`).join('\n')
    const css = cssAssets(options.entries, options.webpackAssetsPath)
    assets.styleTags = css.map(c => `<link rel="stylesheet" type="text/css" href="${c}">`).join('\n')
  }
  return assets
}

export default function createServerRenderer(_options) {
  const options = {...defaults, ..._options}
  const { createStore, getRoutes, gaId } = options
  const sendError = options.sendError || sendTextError
  const sendNotFound = options.sendNotFound || sendTextNotFound
  let alwaysFetch = options.alwaysFetch || []
  if (!_.isArray(alwaysFetch)) alwaysFetch = [alwaysFetch]
  if (!createStore) throw new Error('[fl-react-server] createServerRenderer: Missing createStore from options')
  if (!getRoutes) throw new Error('[fl-react-server] createServerRenderer: Missing getRoutes from options')

  return async function app(req, res) {
    try {
      const { scriptTags, styleTags, linkTags, extractor } = extractAssets(options)

      try {
        const serverState = {
          auth: req.user ? {user: _.omit(req.user, 'password', '_rev')} : {},
        }
        if (options.loadInitialState) _.merge(serverState, await options.loadInitialState(req))

        // deprecated, to be removed in favour of loadInitialState
        if (options.config) serverState.config = _.isFunction(options.config) ? await options.config(req) : options.config

        const history = createMemoryHistory({initialEntries: [req.originalUrl]})
        const store = createStore({history, getRoutes, initialState: serverState})
        const routes = getRoutes(store)

        const branch = matchRoutes(routes, req.path)

        // Check authentication on routes, redirect to login if required
        const redirectUrl = await checkRedirect({req, store, branch})
        if (redirectUrl) return res.redirect(redirectUrl)

        // Wait on fetching component's data before rendering
        history.location.query = qs.parse(history.location.search, {ignoreQueryPrefix: true})
        const fetchResult = await fetchComponentData({store, branch, location: history.location})
        if (fetchResult.logout) req.logout()
        if (fetchResult.redirect) return res.redirect(fetchResult.redirect)
        if (fetchResult.status) {
          if (fetchResult.status.toString() === '404') return sendNotFound(res, styleTags)
          if (fetchResult.status.toString() !== '200') {
            const msg = fetchResult.message || `Sorry, we couldn't complete that request. Status: ${fetchResult.status}`
            return res.status(fetchResult.status).send(msg)
          }
        }

        // Initial state now includes data fetched by components
        let initialState = store.getState()

        // temp solution to rendering admin state
        // todo: make this better. don't include admin reducers / route unless requested
        if (options.omit) initialState = _.omit(initialState, options.omit)

        const component = (
          <Provider store={store}>
            <ConnectedRouter history={history}>
              {renderRoutes(routes)}
            </ConnectedRouter>
          </Provider>
        )

        let renderedHtml

        if (extractor) {
          // using loadable components
          const collectedComponent = extractor.collectChunks(component)
          renderedHtml = renderToString(collectedComponent)
        }
        else {
          // legacy
          renderedHtml = renderToString(component)
        }

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
          <html lang="${options.lang}">
            <head>
              ${head.title}
              ${head.base}
              ${head.meta}
              ${head.link}
              ${head.script}

              ${styleTags}
              ${linkTags}
              ${headerTags}
              <script type="application/javascript">
                window.__INITIAL_STATE__ = ${serialize(initialState, {isJSON: true})}
              </script>
            </head>
            <body id="app">
              <div id="react-view">${renderedHtml}</div>
              ${preScriptTags}
              ${scriptTags}
              ${gaTag}
              ${postScriptTags}
            </body>
          </html>
        `
        res.type('html').send(html)

      }
      catch (err) {
        return sendError(res, err, styleTags)
      }
    }
    catch (err) {
      return sendError(res, err)
    }
  }
}
