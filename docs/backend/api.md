
# API


Frameworkstein automates the creation of REST API routes for your models. 

Controllers for each model are located in `server/api/controllers`. When adding a model using `stein add-model`, a controller for that model is created at `server/api/controllers/ModelNames.js`


## Controllers

These controllers inherit from RestController in the `stein-orm-rest` package. 

Enpoint functions are automatically created for REST verbs as follows:

GET (index) - `/api/models`
GET (show) - `/api/models/1`
POST (create) - `/api/models/`
PUT (update) - `/api/models/1`
DELETE (destroy) - `/api/models/1`

These functions can be overridden, for example:

```javascript
  // set a property when updating
  update(req, res) {
    req.body.someProperty = 'modified by an overriden method'
    super(req, res)
  }
```


## Templates

Templates provide a method to format models before sending them to the client. 

There are two syntaxes for templates, a legacy object format where you can specify fields to select and a function format where you can format a model or list of models however you like.

```javascript
  // object format is a object with a $select key that is a list of fields to pick from the models
  export default {
    $select: ['id', 'name', 'email'],
  }
```

```javascript
  //  
  export default function tempalte(json, options, done) {
    
  }
```

