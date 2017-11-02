# fl-initdb

## Auto create and populate a database from a connection string and backbone models

### Usage

```
import User from '../models/User'
import initdb from 'fl-initdb'

initdb({
  User,
  databaseUrl: process.env.DATABASE_URL,
  modelsDir: path.resolve(__dirname, '../models'),
  scaffold: require(`../../scaffold/${process.env.NODE_ENV}`),
}, err => {if (err) console.log('Error initialising database:', err)})
```
