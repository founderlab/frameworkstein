
export default options =>
`import { requireUser } from './utils'


export default function getRoutes() {

  const routes = [
    {
      path: '/',
      component: require('../modules/app/containers/App'),
      routes: [

        {
          path: '/',
          exact: true,
          component: require('../modules/app/containers/Landing'),
        },

        // User functions
        {
          path: '/login',
          component: require('../modules/users/containers/Login'),
          exact: true,
        }, {
          path: '/reset-request',
          component: require('../modules/users/containers/ResetRequest'),
          exact: true,
        }, {
          path: '/reset',
          component: require('../modules/users/containers/Reset'),
          exact: true,
        }, {
          path: '/confirm-email',
          component: require('../modules/users/containers/EmailConfirm'),
          exact: true,
        },

        // Register
        {
          path: '/register/:step',
          component: require('../modules/users/containers/Register'),
          onEnter: requireUser,
          exact: true,
        }, {
          path: '/register',
          component: require('../modules/users/containers/Register'),
          exact: true,
        },


${options.models.map(modelOption => (`
        // ${modelOption.classPlural}
        {
          path: '/${modelOption.variablePlural}',
          component: require('../modules/${modelOption.variablePlural}/containers/${modelOption.className}List'),
          exact: true,
        }, {
          path: '/${modelOption.variablePlural}/create',
          component: require('../modules/${modelOption.variablePlural}/containers/${modelOption.className}Create'),
          exact: true,
        }, {
          path: '/${modelOption.variablePlural}/:id',
          component: require('../modules/${modelOption.variablePlural}/containers/${modelOption.className}Detail'),
          exact: true,
        }, {
          path: '/${modelOption.variablePlural}/:id/edit',
          component: require('../modules/${modelOption.variablePlural}/containers/${modelOption.className}Edit'),
          exact: true,
        },
`)).join('')}

      ],
    },
  ]

  return routes
}
`
