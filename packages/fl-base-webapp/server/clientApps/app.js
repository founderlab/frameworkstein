import _ from 'lodash'
import { createServerRenderer } from 'fl-react-server'
import config from '../config'
import loadInitialState from './loadInitialState'
import createStore from '../../shared/createStore'
import getRoutes from '../../shared/routes'
import tags from './tags'

const {preScriptTags, ...otherTags} = tags

export default createServerRenderer({
  createStore,
  getRoutes,
  loadInitialState,
  omit: 'admin',
  gaId: config.gaId,
  entries: ['shared', 'app'],
  alwaysFetch: require('../../shared/modules/app/containers/App'),
  verbose: true,

  config: () => _.pick(config, config.clientConfigKeys),

  ...otherTags,
})
