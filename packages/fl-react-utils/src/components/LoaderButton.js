import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'reactstrap'


export default class LoaderButton extends React.Component {

  static propTypes = {
    loading: PropTypes.bool,
    renderLoader: PropTypes.func,
    children: PropTypes.node,
  }

  static defaultProps = {
    renderLoader: () => <i className="inline-loader" />,
  }

  render() {
    const { loading, children, renderLoader, ...btnProps } = this.props
    if (loading) btnProps.disabled = true
    return (
      <Button {...btnProps}>
        {loading ? renderLoader()  : null}
        {children}
      </Button>
    )
  }
}
