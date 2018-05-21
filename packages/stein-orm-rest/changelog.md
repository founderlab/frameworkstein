Please refer to the following release notes when upgrading your version of BackboneREST.

### 0.9.1
* Strip _rev keys and null and undefined values from response JSON

### 0.9.0
* Support for caching index and show routes. Configure with a `cache` prop ont he controllers options. Expects an instance of [cache-manager](https://github.com/BryanDonovan/node-cache-manager) to be provided. Options are: 
```javascript
{
  cache: {
    cache: cacheInstance, 
    ttl: 30000, 
    hash: 'cache hash key prefix', 
    cascade: [...list of related keys to clear on updates],
  }, 
  ...
}```

### 0.8.0
* Support for raw templates
* Support $search param on queries - can be used for case insensitive text matching with mongo / sql dbs. Translates to $like or $regex operator for sql / mongo respectively. Examines the model type to find its db.

### 0.7.2
* Bug fix whitelist (had left references as whitelists)

### 0.7.1
* Bug fix for quoted template names

### 0.7.0
* Upgrade to BackboneORM 0.7.x
* Renamed white_lists option to whitelist

### 0.6.7
* Pass auth from options.auth.relations[key] to join table controllers when defined for individual access
* Mixin Backbone.Events into base JSONController

### 0.6.6
* Bug fix for JSONController missing default logger

### 0.6.5
* Split out RestController generic functionality into JSONController
* Add alias for _call to wrap. _call will be deprecated.

### 0.6.4
* Bug fix for shared auths

### 0.6.3
* Extended auth to include object methods. Use default or named routes
* Added METHODS to RestController to ease blocking

### 0.6.2
* Added 'Content-Type' header 'application/json' to all responses
* Added configure method for headers

### 0.6.1
* Bound function calls in _call

### 0.6.0
* Update for BackboneORM 0.6.0
* Ensured all responses sended JSON

### 0.5.7
* Bug fix for route_prefix joining

### 0.5.6
* Compatability fix for Backbone 1.1.1

### 0.5.5
* Lock Backbone.js to 1.1.0 until new release compatibility issues fixed

### 0.5.4
* Official support for RESTify

### 0.5.3
* Automatically wrap _call in try/catch
* Added blocked array to disable routes

### 0.5.2
* Fixed $values in index when a template is present

### 0.5.1
* Reject duplicate entries in join tables

### 0.5.2
* Initial release
