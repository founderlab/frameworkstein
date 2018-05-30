import _ from 'lodash'

const config = {
  baseUrl: '',
  fetchOptions: {},
}

function configure(_config) {
  _.extend(config, _config)
  console.log('configured',config )
}

export { config, configure }
