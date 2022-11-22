import _ from 'lodash' // eslint-disable-line
import React from 'react'
import PropTypes from 'prop-types'
import { Async } from 'react-select'
import { Link } from 'react-router-dom'
import { Row, Col, Button } from 'reactstrap'


const display = model => model ? (model.name || model.title || model.id) : 'null'

export default class ManyToManyInput extends React.PureComponent {
  static propTypes = {
    model: PropTypes.object,
    models: PropTypes.array,
    relation: PropTypes.object.isRequired,
    label: PropTypes.node.isRequired,
    onLinkRelation: PropTypes.func.isRequired,
    onUnlinkRelation: PropTypes.func.isRequired,
    path: PropTypes.string.isRequired,
    input: PropTypes.object.isRequired,
  }

  state = {}

  loadOptions = (input, callback) => {
    const { relation } = this.props
    const query = input && input.length ? {
      $or: [{name: {$search: input}}],
    } : {}

    relation.reverseModelType.cursor(query).toJSON((err, relatedModels) => {
      if (err) return console.log(err)

      const options = _.map(relatedModels, relatedModel => ({
        relatedModel,
        value: relatedModel.id,
        label: display(relatedModel),
      }))
      callback(null, {options, complete: true})
    })
  }

  handleLinkRelation = option => {
    const { relation, input } = this.props
    this.props.onLinkRelation(option.relatedModel, input.name, relation.virtualIdAccessor)
  }

  handleUnlinkRelationFn = relatedModel => () => {
    const { relation, input } = this.props
    this.props.onUnlinkRelation(relatedModel, input.name, relation.virtualIdAccessor)
  }

  render() {
    const { label, model, path, models } = this.props

    return (
      <div className="m2m form-group">
        <label>{label}</label>
        {model && model.id ? (
          <React.Fragment>
            <Async
              placeholder="Name"
              loadOptions={this.loadOptions}
              value={this.state.selectedRelation}
              onChange={this.handleLinkRelation}
              onBlurResetsInput={false}
              onCloseResetsInput={false}
              defaultOptions
            />

            <div className="list-group mt-2">
              {_.map(models, relatedModel => (
                <div className="list-group-item" key={relatedModel.id}>
                  <Row>
                    <Col className="d-flex align-items-center">
                      <Link to={`${path}/${relatedModel.id}`} target="_blank">{display(relatedModel)}</Link>
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
