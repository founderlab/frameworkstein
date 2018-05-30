# Helper functions for the server side of FounderLab apps

backbone-rest render override example:
-----------------------------
```javascript
...
import { render } from 'fl-server-utils'

const detail = (applications, options, callback) => {
  // applications are a list of plain objects (not backbone models)
  callback(null, _.pick(applications, 'id'))
}
detail.$raw = true // flag it as raw

export default class ApplicationsController extends RestController {
  constructor(options) {
    super(options.app, _.defaults({
      model_type: Application,
      route: '/api/applications',
      auth: [...options.auth, createAuthMiddleware({canAccess})],
      templates: {
        detail: detail,
      },
      default_template: 'detail',
    }, options))
    // Overwrite the render method, making sure to bind it to the controller
    this.render = render.bind(this)
  }
}
```

cors
----
Middleware to add cors headers to all requests

```javascript
// Remember to keep cors before auth middleware
import { cors } from 'fl-server-utils'
app.use(cors(config.origins || '*'))
```

smartSync
---------
Auto select the correct type of BackboneORM sync based on the current database url.
Use this to switch between e.g. mongodb and postgres without any code changes

```javascript
import Backbone from 'backbone'
import { smartSync } from 'fl-server-utils'

const dbUrl = process.env.DATABASE_URL

export default class Task extends Backbone.Model {
  url = `${dbUrl}/tasks`

  schema = {

  }
}

// Use smartSync and it'll auto require the correct module
// Would normally look like e.g. `Task.prototype.sync = require('backbone-mongo').sync(Task)`
Task.prototype.sync = smartSync(dbUrl, Task)
```
