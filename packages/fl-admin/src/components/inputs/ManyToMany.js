import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import { Async } from 'react-select'
import { Link } from 'react-router-dom'
import { Row, Col, Button } from 'reactstrap'


export default class ManyToMany extends React.PureComponent {
  static propTypes = {
    models: PropTypes.array,
    model: PropTypes.object.isRequired,
    relationField: PropTypes.object.isRequired,
    label: PropTypes.string.isRequired,
    onLinkRelation: PropTypes.func.isRequired,
    onUnlinkRelation: PropTypes.func.isRequired,
  }

  state = {}

  loadOptions = (input, callback) => {
    const { relationField } = this.props
    if (!input.length) return callback(null, {options: [], complete: false})
    const RelatedModel = relationField.relation.reverseRelation.modelType

    const query = {
      $or: [{name: {$search: input}}],
    }

    RelatedModel.cursor(query).toJSON((err, relatedModels) => {
      if (err) return console.log(err)

      const options = _.map(relatedModels, relatedModel => ({
        relatedModel,
        value: relatedModel.id,
        label: relationField.modelAdmin.display(relatedModel),
      }))
      callback(null, {options, complete: true})
    })
  }

  handleLinkRelation = option => {
    this.props.onLinkRelation(option.relatedModel)
  }

  handleUnlinkRelationFn = relation => () => {
    this.props.onUnlinkRelation(relation)
  }

  render() {
    const { label, model, models, relationField } = this.props
    const { modelAdmin } = relationField

    return (
      <div className="m2m form-group">
        <label>{label}</label>
        {model.id ? (
          <React.Fragment>
            <Async
              placeholder="Name"
              loadOptions={this.loadOptions}
              value={this.state.selectedRelation}
              onChange={this.handleLinkRelation}
              onBlurResetsInput={false}
              onCloseResetsInput={false}
              autoload={false}
            />

            <div className="list-group mt-2">
              {_.map(models, relatedModel => (
                <div className="list-group-item" key={relatedModel.id}>
                  <Row>
                    <Col className="d-flex align-items-center">
                      <Link to={modelAdmin.link(relatedModel)} target="_blank">{modelAdmin.display(relatedModel)}</Link>
                    </Col>
                    <Col xs="auto">
                      <Button color="danger" size="sm" onClick={this.handleUnlinkRelationFn(relatedModel)}><i className="fa fa-times" /></Button>
                    </Col>
                  </Row>
                </div>
              ))}
            </div>
          </React.Fragment>
        ) : (
          <p className="text-muted">Hit save to edit this relation.</p>
        )}
      </div>
    )
  }
}
