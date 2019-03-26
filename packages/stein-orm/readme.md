## 

[![version][version-badge]][package]
[![MIT License][license-badge]][LICENSE]
[![PRs Welcome][prs-badge]][prs]


[version-badge]: https://img.shields.io/npm/v/stein-orm.svg?style=flat-square
[package]: https://www.npmjs.com/package/stein-orm
[license-badge]: https://img.shields.io/npm/l/stein-orm.svg?style=flat-square
[license]: https://github.com/robinpowered/stein-orm/blob/master/LICENSE
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com


### Frameworkstein ORM


This is the core package for the Frameworkstein Object Relational Mapper (Frameworkstein ORM, or just `stein-orm`).


Frameworkstein ORM consists of a few packages that make it easy to create and query SQL backed REST APIs in Node.js.


Create model definitions, assign them schemas, auto-generate REST endpoints for them then query them using the same powerful query syntax on the client as the server.


The main packages are as follows:

[stein-orm](https://github.com/founderlab/frameworkstein/tree/master/packages/stein-orm)
The core package. Exports functions for creating models and defining relations between them. Also contains a cursor interface for querying models which is extended by either `stein-orm-sql` or `stein-orm-rest`.

[stein-orm-sql](https://github.com/founderlab/frameworkstein/tree/master/packages/stein-orm)
Package that translates `stein-orm` queries into sql statements (using [knex.js](https://knexjs.org/) internally) and sql results into models.

[stein-orm-http](https://github.com/founderlab/frameworkstein/tree/master/packages/stein-orm)
Package that translates `stein-orm` queries into http requests. This allows models to be queried using the same syntax on the client as the server. Assumes that an endpoint has been configured on the server for the model using `stein-orm-rest`.

[stein-orm-rest](https://github.com/founderlab/frameworkstein/tree/master/packages/stein-orm)
Package that generates REST API endpoints for `stein-orm` models. These endpoints can be queried with `stein-orm-http` or with any standard REST client.


### Usage

For a complete example of how the parts work together see the [fl-base-webapp](https://github.com/founderlab/frameworkstein/tree/master/packages/fl-base-webapp) repo. stein-orm models are stored in `server/models` (server side models) and `shared/models` (client side models). stein-orm-rest endpoints can be found in `server/api/controllers`. The `scaffold` directory has examples of creasting and saving models.


##### Model definitions
Models are defined using the `createModel` decorator. Generally You'll want to create two model files, one for the server with your server code with an sql store (`stein-orm-sql`) and one for the client with a http store (`stein-orm-http`).

Server model definition `/server/models/User.js`
```javascript
import { createModel, Model } from 'stein-orm-sql'    // Import from `stein-orm-sql` to use the sql store

@createModel({                                        // The `createModel` decorator configures the model when called
  url: 'postgres://localhost:5432/stein-orm/users',   // The url of your database, including the table name
  schema: () => ({                                    // Schema definition, see [stein-orm-sql](https://github.com/founderlab/frameworkstein/tree/master/packages/stein-orm) for column options and `relations` below for relations.
    name: 'Text',
  }),
})
export default class User extends Model {             // Extending the `stein-orm` `Model` class
  defaults() {                                        // Function returning default properties for new models
    return {name: 'Default name'}
  }
}

```

Client model definition `/shared/models/User.js`
```javascript
import { createModel, Model } from 'stein-orm-http'   // Import from `stein-orm-http` to use the http store

@createModel({                                        // As above, will configure the model with a http store
  url: '/api/users',                                  // The root url of your `stein-orm-rest` api for this model
                                                      // No need to define a schema on the client
})
export default class User extends Model {             
                                                      // No need to define defaults on the client
}

```

##### Relations
Relations are specified in the model schema. There are the following standard sql relations available:

`belongsTo`:  This model has a foreign key to another model
`hasOne`:     One related model has a foreign key to this model
`hasMany`:    Any number of related models have foreign keys to this model

These three relation types can be combined 


This class is created via `Model.cursor()`, which will return an instance of `Cursor` that can be used to build a database query.
`Cursor` shouldn't be instantiated outside of the `Model.cursor()` class method.


#### Query options
Models can be queried with the following query options. These options can be specified with chained methods or properties within a query object prefixed with $.

`one [bool]` return a single object rather than an array

`values [array]` return, for each model found, an array of values rather than an object. For example, Model.cursor().values(['id', name']) will return a 2d array like [[1, 'Bob'], [2, 'Emily']]

`select [array]` select only the given fields from the db

`count [bool]` return a count of the number of models matching the given query

`exists [bool]` return a boolean indicating whether any number of models exist matching the given query

`unique [string]` like `select disctinct`, return no more than one result per distinct value of the given field

`limit [number]` limit results to the given number of rows

`offset [number]` offset results by the given number of rows

`page: [bool]` if true, return paging information with results. Querries will return an object of the form {rows, totalRows, offset}


#### Field modifiers
Each field in a query can either be a plan value, which will be matched against directly, or an object with the following special matches:

`$in [array]` field matches any of the given values `{name: {$in: ['bob', emily']}}` => `name in ('bob', 'emily')`

`$nin [array]` field matches none of the given values `{name: {$nin: ['bob', emily']}}` => `name not in ('bob', 'emily')`

`$exists [bool]` equivalent to a null check `{name: {$exists: true}}` => `name is not null`


#### Query conditions
Advanced conditional operations

`$or [array]` matches any of the given queries `{$or: [{name: 'bob'}, {city: 'sydney'}]}` => `name = 'bob' or city = 'sydney'`

`$and [array]` matches all of the given queries. Doesn't do anything on its own, but is useful when nesting conditionals `{$and: [{name: 'bob'}, {city: 'sydney'}]}` => `name = 'bob' and city = 'sydney'`


#### Relation queries
Related models can be queried using `{'relation.field': value}`. All options available to local fields work with relations. Relations must be configured in each models' schema.

For example, if we had a user model related to a profile model containing a `name` field we could domsomething like `{'profile.name': {$in: ['bob', emily']}}`, which would generate sql similar to `selectfrom users, profiles where profiles.name in ('bob', 'emily') and profiles.user_id = users.id`


#### JSONb queries
JSON fields can be queried in a similar way to related fields: `{'jsonfield.field': value}`

For example, given some models with json data like `{id: 1, nestedUsers: [{name: 'bob'}, {name: 'emily'}]}` we could query on the nestedUsers name field with `{'nestedUsers.name': 'bob'}` or `{'nestedUsers.name': {$in: ['emily', 'frank']}`
