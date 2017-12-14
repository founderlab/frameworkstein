import _ from 'lodash' // eslint-disable-line
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {ButtonToolbar, ButtonGroup, Button} from 'react-bootstrap'
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
    first: PropTypes.node,
    last: PropTypes.node,
  }

  static defaultProps = {
    maxLinks: 5,
    first: '⇤',
    last: '⇥',
    prev: '←',
    next: '→',
  }

  link = page => ({pathname: this.props.location.pathname, query: _.extend({}, this.props.location.query, {page})})

  render() {
    const {itemsPerPage, currentPage, totalItems, next, prev, first, last} = this.props
    if (!totalItems) return null
    const maxLinks = this.props.maxLinks - 1
    const links = []
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    if (!totalPages) return null

    let start = Math.min(Math.floor(currentPage - maxLinks/2), totalPages-maxLinks)
    if (start < 1) start = 1
    const end = Math.min(start+maxLinks, totalPages)

    if (currentPage > 1) {
      links.push(
        <LinkContainer key="first" to={this.link(1)}>
          <Button bsStyle="default">{first}</Button>
        </LinkContainer>
      )
      links.push(
        <LinkContainer key="prev" to={this.link(currentPage-1)}>
          <Button bsStyle="default">{prev}</Button>
        </LinkContainer>
      )
    }

    for (let i=start; i<=end; i++) {
      links.push(
        currentPage === i ? (
          <div key={i} className="btn btn-primary disabled" style={{cursor: 'default'}}>{i}</div>
        ) : (
          <LinkContainer key={i} to={this.link(i)}>
            <Button bsStyle="default">{i}</Button>
          </LinkContainer>
        )
      )
    }

    if (currentPage < totalPages) {
      links.push(
        <LinkContainer key="next" to={this.link(currentPage+1)}>
          <Button bsStyle="default">{next}</Button>
        </LinkContainer>
      )
      links.push(
        <LinkContainer key="last" to={this.link(totalPages)}>
          <Button bsStyle="default">{last}</Button>
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
