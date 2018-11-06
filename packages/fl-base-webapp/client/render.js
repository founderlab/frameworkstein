/* eslint-env browser */
import React from 'react'
import moment from 'moment'

//todo: replace later, react 16 messes with hot loading
import { hydrate } from 'react-dom'
// import { render as hydrate } from 'react-dom'
//

import createHistory from 'history/createBrowserHistory'
import { ConnectedRouter } from 'react-router-redux'
import { Provider } from 'react-redux'
import renderRoutes from '../shared/routes/renderRoutes'
import createStore from '../shared/createStore'

// Set moment locale to aus
moment.locale('en-AU')

export default function(getRoutes) {
  const initialState = window.__INITIAL_STATE__

  const history = createHistory()
  const store = createStore({initialState, history, getRoutes})

  const ele = document.getElementById('react-view')
  if (process.env.NODE_ENV !== 'production') ele.innerHTML = ''

  hydrate((
    <Provider store={store} key="provider">
      <ConnectedRouter history={history}>
        {renderRoutes(getRoutes())}
      </ConnectedRouter>
    </Provider>
  ), ele)
}
