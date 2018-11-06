import _ from 'lodash'
import React from 'react'
import { Switch, Route, Redirect } from 'react-router'
import qs from 'qs'


export default function renderRoutes(routes, extraProps={}) {
  return routes ? React.createElement(
    Switch,
    null,
    routes.map((route, i) => {
      return React.createElement(Route, {
        key: route.key || i,
        path: route.path,
        exact: route.exact,
        strict: route.strict,
        render: function render(props) {
          const sProps = _.extend({}, extraProps, props, {route})
          if (sProps.location) sProps.location.query = qs.parse(sProps.location.search, {ignoreQueryPrefix: true})

          if (route.onEnter) {
            const res = route.onEnter(sProps, props)
            if (res.redirectUrl) return React.createElement(Redirect, {to: res.redirectUrl})
          }
          return React.createElement(route.component, sProps)
        },
      })
    }),
  ) : null
}
