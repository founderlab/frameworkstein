
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
