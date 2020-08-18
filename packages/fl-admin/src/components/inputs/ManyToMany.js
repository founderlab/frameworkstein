import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import AsyncSelect from 'react-select/async'
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

  loadOptions = async input => {
    try {
      const { relationField } = this.props
      if (!input.length) return []
      const RelatedModel = relationField.relation.reverseRelation.modelType

      const query = {
        $or: [{name: {$search: input}}],
      }

      const relatedModels = await RelatedModel.cursor(query).toJSON()

      const options = _.map(relatedModels, relatedModel => ({
        relatedModel,
        value: relatedModel.id,
        label: relationField.modelAdmin.display(relatedModel),
      }))
      return options
    }
    catch (err) {
      console.log(err)
      return []
    }
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
            <AsyncSelect
              placeholder="Name"
              loadOptions={this.loadOptions}
              value={this.state.selectedRelation}
              onChange={this.handleLinkRelation}
            />

            <div className="list-group mt-2">
              {_.map(models, relatedModel => (
                <div className="list-group-item" key={relatedModel.id}>
                  <Row>
                    <Col className="d-flex align-items-center">
                      <Link to={modelAdmin.link(relatedModel)} target="_blank">{modelAdmin.display(relatedModel)}</Link>
                    </Col>
                    <Col xs="auto">
                      <Button color="danger" size="sm" onClick={this.handleUnlinkRelationFn(relatedModel)}><i className="fal fa-times" /></Button>
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
