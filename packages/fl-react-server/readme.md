## Server side renderer function for React, used in Frameworkstein apps

[![version][version-badge]][package]
[![MIT License][license-badge]][LICENSE]
[![PRs Welcome][prs-badge]][prs]

createServerRenderer
--------------------

Helper method that takes care of a bunch of boilerplate for rendering react components server side. 

Usage: 
------

```javascript
import _ from 'lodash'
import {createServerRenderer} from 'fl-react-server'
import config from '../config'
import createStore from '../../shared/createStore'
import getRoutes from '../../shared/routes'
import loadInitialState from '../loadInitialState'
import App from '../../shared/modules/app/containers/App'

export default createServerRenderer({
  createStore,                        // Function to create your redux store.

  getRoutes,                          // Function that returns your react-router routes.

  config,                             // Object or function that returns an object. 
                                      // Config gets added to your stores initial state.

  loadInitialState: (req, callback) => callback(null, state),                   
                                      // Function called on each request. 
                                      // You can load up any extra data to place in your store here. 
                                      // It'll be added to the initial state.
  
  omit: 'admin',                      // String or list of strings
                                      // These properties will be omitted from the stores initial state.

  alwaysFetch: App,                   // Component or list of components that will have their 
                                      // fetchData method called on each request.
})

```


[version-badge]: https://img.shields.io/npm/v/fl-react-server.svg?style=flat-square
[package]: https://www.npmjs.com/package/fl-react-server
[license-badge]: https://img.shields.io/npm/l/fl-react-server.svg?style=flat-square
[license]: https://github.com/robinpowered/fl-react-server/blob/master/LICENSE
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com