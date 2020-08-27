import _ from 'lodash' // eslint-disable-line
import qs from 'qs'
import React from 'react'
import PropTypes from 'prop-types'
import { ButtonToolbar, ButtonGroup, Button } from 'reactstrap'
import { Link } from 'react-router-dom'
import classNames from 'classnames'


export default class Pagination extends React.Component {
  static propTypes = {
    location: PropTypes.object,
    query: PropTypes.object,
    path: PropTypes.object,
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

  query = () => this.props.query || qs.parse(this.props.location.search, {ignoreQueryPrefix: true})
  link = page => `${this.props.path || this.props.location.pathname}?${qs.stringify({...this.query(), page})}`

  render() {
    const { itemsPerPage, currentPage, totalItems, next, prev, first, last } = this.props
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
        <Button tag={Link} key="first" to={this.link(1)}>{first}</Button>
      )
      links.push(
        <Button tag={Link} key="prev" to={this.link(currentPage-1)}>{prev}</Button>
      )
    }

    for (let i=start; i<=end; i++) {
      links.push(
        currentPage === i ? (
          <div key={i} className="btn btn-primary disabled" style={{cursor: 'default'}}>{i}</div>
        ) : (
          <Button tag={Link} key={i} to={this.link(i)}>{i}</Button>
        )
      )
    }

    if (currentPage < totalPages) {
      links.push(
        <Button tag={Link} key="next" to={this.link(currentPage+1)}>{next}</Button>
      )
      links.push(
        <Button tag={Link} key="last" to={this.link(totalPages)}>{last}</Button>
      )
    }

    return (
      <ButtonToolbar className={classNames(this.props.className, 'pagination-buttons')}>
        <ButtonGroup size="sm">
          {links}
        </ButtonGroup>
      </ButtonToolbar>
    )
  }
}
