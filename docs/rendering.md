# Rendering


## Server-side rendering

Also known as _Isomorphic_ or _Universal_ JavaScript, all of which are just fancy names for rendering client JS on the server before sending it to the browser.

A Universal JavaScript app is able to be run on the server (Node) as well as the client (Browser).

This means that the server will, when receiving a request for a page, run the client app and render out the pages complete html to ship to the client.

The client will then run the same JavScript. React will see that there's already a rendered DOM tree and happily continue to use it.

See [this strongloop post](https://strongloop.com/strongblog/node-js-react-isomorphic-javascript-why-it-matters) for more information.

See [this post on the term "universal"](https://medium.com/@mjackson/universal-javascript-4761051b7ae9) for why we're using two different words for it.


## How Fameworkstein renders React on the server

A server renderer - an express route handler that handles the details of rendering a React app - is created by the `createServerRenderer`  function from the [fl-react-server](https://github.com/founderlab/frameworkstein/tree/master/packages/fl-react-server) package.

A wildcard route is registered with Express (after all other routes, as a catchall) that calls the server renderer.

In Frameworkstein apps this configuration can be found in the `server/clientApps` directory.

```javascript
// server/clientApps/app.js
// ------------------------

import { createServerRenderer } from 'fl-react-server'
import createStore from '../../shared/createStore'
import getRoutes from '../../shared/routes'
import AppContainer from '../../shared/modules/app/containers/App'

export default createServerRenderer({
  createStore,
  getRoutes,
  alwaysFetch: AppContainer,
})
```

```javascript
// server/clientApps/index.js
// --------------------------

import admin from './admin'
import app from './app'

export default (options) => {
  if (!options.app) throw new Error('clientApps init: Missing app from options')
  options.app.get('/admin*', admin)
  options.app.get('*', app)
}
```

That's it!

Well, there's a bit more, but you can look at [fl-react-server](https://github.com/founderlab/frameworkstein/tree/master/packages/fl-react-server) for details of the dirty work.

