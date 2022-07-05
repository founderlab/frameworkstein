module.exports = function(api) {
  api.cache(true)

  return {
    presets: [['@babel/preset-env'], '@babel/preset-react'],
    plugins: [
      ['@babel/plugin-proposal-decorators', {legacy: true}],
      ['@babel/plugin-proposal-class-properties', {loose : true}],
      ['@babel/plugin-proposal-private-methods', {loose: true}],
      ['@babel/plugin-proposal-private-property-in-object', {loose: true}],
      '@babel/plugin-transform-runtime',
      '@babel/plugin-proposal-object-rest-spread',
      'add-module-exports',
      'transform-require-default'
    ]
  }
}
