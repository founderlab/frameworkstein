
#### Example

```javascript
import RestController from 'stein-orm-rest'

const customAuthorization = (req, res, next) => {
  if (!req.user.canAccessTask(req)) {
    return res.status(401).send('you cannot access this task')
  }
  return next()
};

new RestController(app, {
  auth: [customAuthorization],
  modelType: Task,
  route: '/tasks',
})
```

#### Timing System

The RestController includes a timing system that can track the duration of database queries and provide detailed information about them. This is useful for performance monitoring and debugging.

##### Basic Usage

```javascript
import RestController from 'stein-orm-rest'

// Enable timing when creating the controller
const controller = new RestController(app, {
  modelType: User,
  route: '/api/users',
  enableTiming: true,
  timingCallback: (timingData, req) => {
    if (timingData.duration > 500) {
      console.warn(`Slow query detected: ${timingData.duration}ms`);
      console.warn(`SQL: ${timingData.sqlQuery}`);
    }
  }
});
```

##### Setting the Callback Later

```javascript
// Set or update the timing callback after controller creation
controller.setTimingCallback((timingData, req) => {
  // Log all queries to a monitoring service
  monitoringService.logQuery({
    duration: timingData.duration,
    query: timingData.sqlQuery,
    route: timingData.route,
    method: timingData.method
  });
});
```

##### Timing Data Structure

The `timingData` object passed to your callback contains:

- `route`: The route being accessed
- `method`: The HTTP method
- `startTime`: When the query started
- `endTime`: When the query completed
- `duration`: How long the query took (in milliseconds)
- `query`: The query parameters
- `sqlQuery`: The SQL query that was executed

This timing system only tracks database queries made through the `fetchJSON` method, which is used by the controller's `index` and `show` methods.
