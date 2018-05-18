import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import ReactMarkdown from 'react-markdown'

export default class Markdown extends React.Component {

  static propTypes = {
    source: PropTypes.string,
    markdownProps: PropTypes.object,
  }

  static defaultProps = {
    markdownProps: {
      escapeHtml: true,
      renderers: {
        Link: props => (<a href={props.href} target="_blank" rel="noopener noreferrer">{props.children}</a>),
      },
    },
  }

  render() {
    if (!this.props.source) return null

    return (
      <ReactMarkdown source={this.props.source || ''} {...this.props.markdownProps} {...this.props} />
    )
  }
}
