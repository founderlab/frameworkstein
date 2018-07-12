# Migrations for stein-orm

[![NPM version](https://img.shields.io/npm/v/stein-orm-migrations.svg?style=flat)](https://www.npmjs.org/package/stein-orm-migrations)
[![Build Status](https://travis-ci.org/founderlab/stein-orm-migrations.svg?branch=master)](https://travis-ci.org/founderlab/stein-orm-migrations)
[![Coverage Status](https://img.shields.io/coveralls/founderlab/stein-orm-migrations.svg)](https://coveralls.io/r/founderlab/stein-orm-migrations?branch=master)
[![License](https://img.shields.io/npm/l/jfs.svg)](https://github.com/founderlab/stein-orm-migrations/blob/master/LICENSE)

stein-orm-migrations is an implementation of migrations for stein-orm, forked from [fl-migrations](https://github.com/founderlab/fl-migrations)

## Install
```bash
npm install stein-orm-migrations
```

## Usage

### Sample Migration File

```javascript
// 00001_migration.js
import YourModel from './some_model_directory/YourModel'

module.exports = {
  up: (callback) => {
    const newModel = new YourModel({field1: 'someValue', field2: 'someOtherValue'})
    newModel.save(callback)
  },
}
```

### Execute Migrations
```javascript
import { Migrations } from 'stein-orm-migrations'

migrations = new Migrations({
  // required, the location of the migrations files
  path: './my_migrations_directory'

  // optional, the path to match migration files, defaults to '.js$'
  pattern: '.js$'
})

migrations.migrate()
```

### Reset Migrations
```javascript
migrations.reset()
```

## Tests
```bash
eval $(cat .test_env) npm run create-db
eval $(cat .test_env) npm test
```
