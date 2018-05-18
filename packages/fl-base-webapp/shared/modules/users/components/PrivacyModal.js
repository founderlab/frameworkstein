import _ from 'lodash' // eslint-disable-line
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { Modal, ModalBody } from 'reactstrap'
import Privacy from '../../app/components/Privacy'

export default class TermsModal extends Component {

  static propTypes = {
    show: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
  }

  render() {
    return (
      <Modal size="lg" isOpen={this.props.show} toggle={this.props.toggle}>
        <ModalBody>
          <Privacy />
        </ModalBody>
      </Modal>
    )
  }
}
