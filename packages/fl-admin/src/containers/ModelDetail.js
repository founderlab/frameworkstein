import _ from 'lodash' // eslint-disable-line
import React, {PropTypes} from 'react'
import warning from 'warning'
import {Link} from 'react-router'
import {Container, Row, Col} from 'reactstrap'
import createModelDetailForm from '../components/create/ModelDetailForm'

export default function ModelDetail(props) {

  const {modelAdmin, modelStore, id, config, handleSaveFn, handleDeleteFn} = props
  const modelIm = modelStore.get('models').get(id)
  const model = modelIm ? modelIm.toJSON() : {}
  warning(model, `[fl-admin] ModelDetail: Model ${modelAdmin.name} not loaded with id ${id}`)
  const ModelDetailForm = createModelDetailForm(model)

  return (
    <section className="fla-model-detail">
      <Container fluid>
        <Row>
          <Col xs={12}>
            <p className="fla-back"><Link to={modelAdmin.link()}><i className="fa fa-chevron-left" />{modelAdmin.plural}</Link></p>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <h1>{modelAdmin.display(model)}</h1>
          </Col>
        </Row>
        <ModelDetailForm
          formKey={model.id}
          model={model}
          modelAdmin={modelAdmin}
          config={config}
          onSubmit={handleSaveFn(model)}
          onDelete={handleDeleteFn(model)}
        />
      </Container>
    </section>
  )
}

ModelDetail.propTypes = {
  id: PropTypes.string,
  modelStore: PropTypes.object,
  modelAdmin: PropTypes.object,
  // config: PropTypes.object,
  handleSaveFn: PropTypes.func,
  handleDeleteFn: PropTypes.func,
}
