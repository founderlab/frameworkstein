import _ from 'lodash'


// gloabl config, don't set anything that shouldn't be shared amongst users when using on the server

const config = {
  baseUrl: '',
  fetchOptions: {},
}

function configure(_config) {
  _.extend(config, _config)
}

export { config, configure }
