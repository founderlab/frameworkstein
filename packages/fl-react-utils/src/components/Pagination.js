import qs from 'qs'
import React from 'react'
import PropTypes from 'prop-types'
import { Pagination as RSPagination, PaginationItem, PaginationLink } from 'reactstrap'
import { Link } from 'react-router-dom'


const LEFT_PAGE = 'LEFT'
const RIGHT_PAGE = 'RIGHT'

const range = (from, to, step=1) => {
  let i = from
  const range = []
  while (i <= to) {
    range.push(i)
    i += step
  }
  return range
}

export default class Pagination extends React.Component {
  static propTypes = {
    location: PropTypes.object,
    query: PropTypes.object,
    path: PropTypes.string,
    itemsPerPage: PropTypes.number.isRequired,
    currentPage: PropTypes.number.isRequired,
    className: PropTypes.string,
    totalItems: PropTypes.number,
    maxLinks: PropTypes.number,
    onSetPage: PropTypes.func,
    link: PropTypes.func,
    pageNeighbours: PropTypes.number,
  }

  static defaultProps = {
    pageNeighbours: 2,
  }

  query = () => this.props.query || qs.parse(this.props.location.search, {ignoreQueryPrefix: true})

  link = page => {
    if (this.props.link) return this.props.link(page)
    return `${this.props.path || this.props.location.pathname}?${qs.stringify({...this.query(), page})}`
  }

  toPageProps = page => {
    if (this.props.onSetPage) return {onClick: () => this.props.onSetPage(page)}
    return {to: this.link(page), tag: Link}
  }

  // courtesy of https://www.digitalocean.com/community/tutorials/how-to-build-custom-pagination-with-react
  fetchPageNumbers = () => {
    const { itemsPerPage, currentPage, totalItems, pageNeighbours } = this.props
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    if (!totalPages) return null

    /**
     * totalNumbers: the total page numbers to show on the control
     * totalBlocks: totalNumbers + 2 to cover for the left(<) and right(>) controls
     */
    const totalNumbers = (pageNeighbours * 2) + 3
    const totalBlocks = totalNumbers + 2

    if (totalPages > totalBlocks) {
      const startPage = Math.max(2, currentPage - pageNeighbours)
      const endPage = Math.min(totalPages - 1, currentPage + pageNeighbours)
      let pages = range(startPage, endPage)

      /**
       * hasLeftSpill: has hidden pages to the left
       * hasRightSpill: has hidden pages to the right
       * spillOffset: number of hidden pages either to the left or to the right
       */
      const hasLeftSpill = startPage > 2
      const hasRightSpill = (totalPages - endPage) > 1
      const spillOffset = totalNumbers - (pages.length + 1)

      switch (true) {
        // handle: (1) < {5 6} [7] {8 9} (10)
        case (hasLeftSpill && !hasRightSpill): {
          const extraPages = range(startPage - spillOffset, startPage - 1)
          pages = [LEFT_PAGE, ...extraPages, ...pages]
          break
        }

        // handle: (1) {2 3} [4] {5 6} > (10)
        case (!hasLeftSpill && hasRightSpill): {
          const extraPages = range(endPage + 1, endPage + spillOffset)
          pages = [...pages, ...extraPages, RIGHT_PAGE]
          break
        }

        // handle: (1) < {4 5} [6] {7 8} > (10)
        case (hasLeftSpill && hasRightSpill):
        default: {
          pages = [LEFT_PAGE, ...pages, RIGHT_PAGE]
          break
        }
      }

      return [1, ...pages, totalPages]
    }

    return range(1, totalPages)
  }

  renderPageNumber = page => {
    const { currentPage } = this.props

    if (page === LEFT_PAGE) {
      return (
        <PaginationItem key={page}><PaginationLink {...this.toPageProps(currentPage-1)} previous /></PaginationItem>
      )
    }

    if (page === RIGHT_PAGE) {
      return (
        <PaginationItem key={page}><PaginationLink {...this.toPageProps(currentPage+1)} next /></PaginationItem>
      )
    }

    return page === currentPage ? (
      <PaginationItem key={page} active><PaginationLink>{page}</PaginationLink></PaginationItem>
    ) : (
      <PaginationItem key={page}><PaginationLink {...this.toPageProps(page)}>{page}</PaginationLink></PaginationItem>
    )
  }

  render() {
    const pageNumbers = this.fetchPageNumbers()
    if (!pageNumbers) return null

    return (
      <RSPagination className={this.props.className}>
        {pageNumbers.map(this.renderPageNumber)}
      </RSPagination>
    )
  }
}
