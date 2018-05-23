import _ from 'lodash'
import path from 'path'
import { createServerRenderer } from 'fl-react-server'
import config from '../config'
import createStore from '../../shared/createStore'
import getRoutes from '../../shared/routes'
import tags from './tags'
import loadInitialState from './loadInitialState'

// configure fl-auth before doing anything else to make sure the reducers exist before creating our store
import '../../shared/configureAdmin'

export default createServerRenderer({
  createStore,
  getRoutes,
  loadInitialState,
  entries: ['shared', 'admin'],
  alwaysFetch: require('../../shared/modules/app/containers/App'),
  config: _.pick(config, config.clientConfigKeys),
  preScriptTags: tags.preScriptTags,
  webpackAssetsPath: path.resolve(__dirname, '../../webpack-assets.json'),
})
