import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import { Input } from 'reactstrap'


export default class SearchBox extends React.Component {

  static propTypes = {
    keyupDelay: PropTypes.number,
    minSearchLength: PropTypes.number,
    onSearch: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    searchString: PropTypes.string,
  }

  static defaultProps = {
    keyupDelay: 1000,
    minSearchLength: 3,
    placeholder: 'Search',
  }

  constructor() {
    super()
    this.state = {
      searchValue: '',
    }
  }

  componentWillUnmount = () => {
    clearTimeout(this.state.searchTimeout)
  }

  handleSearchChange = event => {
    if (this.state.searchTimeout) clearTimeout(this.state.searchTimeout)
    const searchValue = event.target.value
    if (this.state.searchValue && searchValue === this.state.searchValue) return
    if (searchValue.length > 0 && searchValue.length < this.props.minSearchLength) return

    const searchTimeout = setTimeout((value => () => this.props.onSearch(value))(searchValue), this.props.keyupDelay)

    this.setState({searchTimeout, searchValue})
  }

  render() {
    return (
      <Input
        type="search"
        defaultValue={this.props.searchString}
        placeholder={this.props.placeholder}
        onChange={this.handleSearchChange}
      />
    )
  }
}
