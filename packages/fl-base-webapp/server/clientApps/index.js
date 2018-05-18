import admin from './admin'
import app from './app'


export default (options) => {
  if (!options.app) throw new Error('clientApps init: Missing app from options')
  options.app.get('/admin*', admin)
  options.app.get('*', app)
}
