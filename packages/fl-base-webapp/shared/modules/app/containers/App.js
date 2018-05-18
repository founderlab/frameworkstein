import _ from 'lodash' // eslint-disable-line
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { renderRoutes } from 'react-router-config'
import Navbar from '../components/Navbar'
import headerTags from '../headerTags'
import { loadAppSettings } from '../actions'


@connect(state => ({
  config: state.config,
  auth: state.auth,
  profiles: state.profiles,
}))
export default class App extends Component {

  static propTypes = {
    config: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    auth: PropTypes.object.isRequired, // eslint-disable-line
    profiles: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
  }

  static childContextTypes = {
    url: PropTypes.string,
    s3Url: PropTypes.string,
    publicPath: PropTypes.string,
  }

  static async fetchData({store}) {
    const {app} = store.getState()
    if (!app.get('loaded')) return store.dispatch(loadAppSettings())
  }

  state = {}

  getChildContext() {
    return {
      url: this.state.url,
      s3Url: this.state.s3Url,
      publicPath: this.state.publicPath,
    }
  }

  componentWillMount() {
    if (!this.state.url) {
      this.setState({
        url: this.props.config.get('url'),
        s3Url: this.props.config.get('s3Url'),
        publicPath: this.props.config.get('publicPath'),
      })
    }
  }

  render() {
    const {profiles, location, route} = this.props
    const profileIm = profiles.get('active')
    const profile = profileIm && profileIm.toJSON()

    const title = `Frameworkstein`
    const description = `Rarr`
    const pageUrl = `${this.state.url}${location.pathname}`

    return (
      <div id="app-outer" className={this.state.client+''}>
        <Helmet titleTemplate="%s | Frameworkstein">
          {headerTags(this.props)}
          <title itemProp="name" lang="en">{title}</title>
          <meta name="description"        content={description} />
          <meta property="og:title"       content={title} />
          <meta property="og:description" content={description} />
          <meta property="og:image"       content="https://frameworkstein.com/public/images/landing-image3x.png" />
          <meta property="og:type"        content="website" />
          <meta property="og:url"         content={pageUrl} />
        </Helmet>
        <Navbar
          profile={profile}
        />
        <div className="app-content mt-3">{renderRoutes(route.routes)}</div>
      </div>
    )
  }
}
