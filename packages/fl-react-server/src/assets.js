import _ from 'lodash'

function getAssetJSON(webpackAssetsPath) {
  return process.env.NODE_ENV === 'development' ? JSON.parse(require('fs').readFileSync(webpackAssetsPath).toString()) : require(webpackAssetsPath)
}

export function jsAssets(entries, webpackAssetsPath) {
  const assets = getAssetJSON(webpackAssetsPath)
  return _(entries).map(e => assets[e].js).compact().value()
}

export function cssAssets(entries, webpackAssetsPath) {
  if (process.env.NODE_ENV === 'development') return []
  const assets = getAssetJSON(webpackAssetsPath)
  return _(entries).map(e => assets[e].css).compact().value()
}
