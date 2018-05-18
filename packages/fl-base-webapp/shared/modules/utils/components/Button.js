import _ from 'lodash' // eslint-disable-line
import React from 'react'
import { Button } from 'fl-react-utils'

export default class LoaderButton extends React.Component {

  static defaultProps = {
    renderLoader: () => (<i className="fa fa-spinner fa-spin" />),
  }

  render() {
    return (<Button {...this.props} />)
  }
}
