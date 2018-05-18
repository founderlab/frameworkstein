import _ from 'lodash' // eslint-disable-line
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { Modal, ModalBody } from 'reactstrap'
import Terms from '../../app/components/Terms'


export default class TermsModal extends Component {

  static propTypes = {
    show: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
  }

  render() {
    return (
      <Modal size="lg" isOpen={this.props.show} toggle={this.props.toggle}>
        <ModalBody>
          <Terms />
        </ModalBody>
      </Modal>
    )
  }
}
