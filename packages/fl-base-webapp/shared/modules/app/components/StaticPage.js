import _ from 'lodash' // eslint-disable-line
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import ReactMarkdown from 'react-markdown'
import { Container, Row, Col } from 'reactstrap'


export default class StaticPage extends Component {
  render() {
    const { page } = this.props
    return (
      <div style={{paddingTop: 60}}>
        <Container>
          <Row>
            <Col xs={12}>
              <h2 className="text-center">{page.title}</h2>
              <ReactMarkdown source={page.contentMd || ''} />
            </Col>
          </Row>
        </Container>
      </div>
    )
  }
}

StaticPage.propTypes = {
  page: PropTypes.object.isRequired,
}
