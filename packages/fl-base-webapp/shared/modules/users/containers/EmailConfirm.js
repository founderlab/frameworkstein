import _ from 'lodash' // eslint-disable-line
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import qs from 'qs'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
// import { push } from 'redux-router'
import { confirmEmail } from 'fl-auth-redux'
import EmailConfirm from '../components/EmailConfirm'


@connect(state => _.extend(_.pick(state, 'auth', 'config'), {}), {confirmEmail})
export default class EmailConfirmContainer extends Component {

  static propTypes = {
    auth: PropTypes.object,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    confirmEmail: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
  }

  static contextTypes = {
    url: PropTypes.string.isRequired,
  }

  componentDidMount(props) {
    this.confirm(props)
  }

  componentWillReceiveProps(props) {
    this.confirm(props)
  }

  confirm(_props) {
    const props = _props || this.props
    const {auth} = props
    const {url} = this.context
    const query = this.query()
    if (!(auth.get('errors') && auth.get('errors').get('confirmEmail')) && !auth.get('loading') && !auth.get('emailConfirmed')) {
      this.props.confirmEmail(`${url}/confirm-email`, query.email, query.token, err => {
        err && console.log(err)
        this.props.history.push('/')
      })
    }
  }

  query = () => qs.parse(this.props.location.search, { ignoreQueryPrefix: true })

  render() {
    const {auth} = this.props
    const loading = auth.get('loading')
    const err = auth.get('errors') && auth.get('errors').get('confirmEmail')
    const emailConfirmed = auth.get('emailConfirmed')

    return (
      <div>
        <Helmet title="Confirm your email" />
        <EmailConfirm
          errorMsg={err ? err.toString() : ''}
          loading={loading}
          emailConfirmed={emailConfirmed}
        />
      </div>
    )
  }
}
