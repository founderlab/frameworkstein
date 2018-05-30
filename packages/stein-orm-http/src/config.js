import _ from 'lodash'

const config = {
  baseUrl: '',
  fetchOptions: {},
}

function configure(_config) {
  _.extend(config, _config)
}

export { config, configure }
