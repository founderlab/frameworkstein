# Frameworkstein
Monstrous React and React Native app development


### Frameworkstein helps you build React and React Native apps quickly using the best stuff from the ecosystem.

```javascript
$ npm install -g frameworkstein

$ stein new my-electric-react-app

$ stein new-mobile my-ghastly-react-native-app
```

Frameworkstein isn't a framework. It's a collection of modules that work well and the glue to make them work well together. It covers:


### Auth

The fl-auth-* collection of modules uses [passport](http://www.passportjs.org/) for user authentication.

Included are login forms in React, Redux actions and a reducer to do the dirty work, and all that annoying email confirmation / password reset junk.

Facebook and LinkedIn logins work out of the box too.


### Automagic admin

[fl-admin](https://github.com/founderlab/frameworkstein/tree/master/packages/fl-admin) will automatically generate an admin site for you.

Each model in your app has its own page where you can create, edit, and delete its data.


### Data loading

Frameworkstein gives you a data loading story for your components that just works.

Load data asynchronously, and defer rendering until it's done (or don't).

Works the same whether your components are being rendered on the client or server.


### Custom ORM

Frameworkstein uses [stein-orm](https://github.com/founderlab/frameworkstein/tree/master/packages/stein-orm) to talk to your database.

[stein-orm](https://github.com/founderlab/frameworkstein/tree/master/packages/stein-orm) is an ORM supporting PostgreSQL and HTTP. 

Supporting HTTP means you can use the same sytax for working with your models in the browser as easily as on the server.

[stein-orm-rest](https://github.com/founderlab/frameworkstein/tree/master/packages/stein-orm-rest) automatically generatest REST endpoints for each of your models.

Develop your CRUD rapidly with the freedom to customise endpoints if you find the need.


### Quickstart with a CLI

Create a new web or mobile app with a single command.

Redux and Webpack boilerplate is generated for you.

Hot loading will just work - you can get straight into making stuff.
