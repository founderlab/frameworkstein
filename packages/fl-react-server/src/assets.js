import _ from 'lodash'

const assetJSON = {}

function getAssetJSON(webpackAssetsPath) {
  if (assetJSON[webpackAssetsPath]) return assetJSON[webpackAssetsPath]
  assetJSON[webpackAssetsPath] = process.env.NODE_ENV === 'development' ? JSON.parse(require('fs').readFileSync(webpackAssetsPath).toString()) : require(webpackAssetsPath)
  return assetJSON[webpackAssetsPath]
}

export function jsAssets(entries, webpackAssetsPath) {
  const fileNames = []
  const assets = getAssetJSON(webpackAssetsPath)
  _.forEach(entries, e => {
    try {
      fileNames.push(assets[e].js)
    }
    catch (err) {
      console.error('Could not find asset JSON for js entry', e)
    }
  })
  return fileNames
}

export function cssAssets(entries, webpackAssetsPath) {
  if (process.env.SKIP_CSS) return []
  const fileNames = []
  const assets = getAssetJSON(webpackAssetsPath)
  _.forEach(entries, e => {
    try {
      fileNames.push(assets[e].css)
    }
    catch (err) {
      console.error('Could not find asset JSON for css entry', e)
    }
  })
  return fileNames
}
