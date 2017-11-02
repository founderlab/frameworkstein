import _ from 'lodash' // eslint-disable-line
import React, {Component, PropTypes} from 'react'
import {ButtonToolbar, ButtonGroup, Button, Glyphicon} from 'react-bootstrap'
import {LinkContainer} from 'react-router-bootstrap'
import classNames from 'classnames'

export default class Pagination extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    itemsPerPage: PropTypes.number.isRequired,
    currentPage: PropTypes.number.isRequired,
    className: PropTypes.string,
    totalItems: PropTypes.number,
    maxLinks: PropTypes.number,
    prev: PropTypes.node,
    next: PropTypes.node,
  }

  static defaultProps = {
    maxLinks: 4,
    next: (<Glyphicon glyph="chevron-right" />),
  }

  link = page => ({pathname: this.props.location.pathname, query: _.extend({}, this.props.location.query, {page})})

  render() {
    const {location, itemsPerPage, currentPage, totalItems, next, prev} = this.props
    if (!totalItems) return null
    const maxLinks = this.props.maxLinks - 1
    const links = []
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    if (!totalPages) return null

    let start = Math.min(Math.floor(currentPage - maxLinks/2), totalPages-maxLinks)
    if (start < 1) start = 1
    const end = Math.min(start+maxLinks, totalPages)

    if (start > 1) {
      links.push(
        <LinkContainer key={1} to={this.link(1)}>
          <Button bsStyle="default">1</Button>
        </LinkContainer>
      )
      start = start + 1
    }

    for (let i=start; i<=end; i++) {
      links.push(
        <LinkContainer key={i} to={this.link(i)}>
          <Button bsStyle={currentPage === i ? 'primary' : 'default'}>{i}</Button>
        </LinkContainer>
      )
    }

    if (end < totalPages) {
      links.push(
        <LinkContainer key="next" to={this.link(currentPage+1)}>
          <Button bsStyle="default">{next}</Button>
        </LinkContainer>
      )
    }

    if (prev && currentPage > 1) {
      links.unshift(
        <LinkContainer key="prev" to={this.link(currentPage-1)}>
          <Button bsStyle="default">{prev}</Button>
        </LinkContainer>
      )
    }

    return (
      <ButtonToolbar className={classNames(this.props.className, 'pagination-buttons')}>
        <ButtonGroup bsSize="small">
          {links}
        </ButtonGroup>
      </ButtonToolbar>
    )
  }
}
