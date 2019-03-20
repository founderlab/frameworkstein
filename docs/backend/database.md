
# Database


## DBMS
Frameworkstein is designed to use PostgreSQL for database storage. 

Previous versions also supported MongoDB and other SQL variants. As features were added that were only possible with Postgres, support for other databases was dropped with the first version of [stein-orm](backend/orm.md).


## Client and server models

Each [stein-orm](backend/orm.md) model is defined twice in Frameworkstein - once for the server and once for the client. 

The server model (located in `server/models/ModelName.js`) is configured with `stein-orm-sql` to read & write data from your postgres database. This model cannot be used on the client.

The client model (located in `shared/models/ModelName.js`) is configured with `stein-orm-http` to read & write data from a REST endpoint that will, in turn, use your server model to access your postgres database. This model can be used on both the client and server, but the server model should be preferred in the latter case.


## Schema conventions
Each [stein-orm](backend/orm.md) model has a schema describing its non-relation fields located in `shared/models/schemas/modelName.js`.

This schema file is stored separately from the model as it is used in both client (`shared/models`) and server (`server/models`) models.

Fields are named with `camelCase` in the same manner as our JavaScript variables.

Each model automatically has an `id` field generated as its primary key.

Keep in mind that fields with uppercase characters will require the use of double quotes when running sql commands manually on the database. e.g. `select "firstName" from profiles` requires the double quotes around `firstName`.

Dates are expected to be suffixed with `Date`, for example `createdDate`.

Urls are expected to be suffixed with `Url`, for example `avatarUrl`.

Images stored on s3 are expected to be suffixed with `Image`, for example `avatarImage`.


## Relation conventions

Each [stein-orm](backend/orm.md) model has its relations defined within its model file (either `shared/models/ModelName.js` or `server/models/ModelName.js`).

Relations should be declared on both models they reference. Each relation requires a `type` that will, when combined with the reverse relation, define the type of relationship.

The available relation types are:

`belongsTo -> hasOne`: A one-to-one relation, with the foreign key location on the model using the 'belongsTo' type.
`belongsTo -> hasMany`: A one-to-many relation, with the foreign key location on the model using the 'belongsTo' type.
`hasMany -> hasMany`: A many-to-many relation, with a join table automatically created to hold foreign keys.

Relation foreign keys are defined as the relation name followed by `_id`, for example `relationField_id`. The `_id` convention is intentionally different from the standard field style to indicate that a field is a foreign key rather than a standard property.


## Automatic fields

There are a couple of fields that, if present in a models schema, will be automatically populated by the orm. If manually set then no autopopulation will occur.

  - `createdDate` - set the first time the model is saved
  - `updatedDate` - set each time the model is saved
