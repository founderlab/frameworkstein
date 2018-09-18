import _ from 'lodash'
import naming from '../lib/naming'
import Relation from './Relation'

// @nodoc
export default class One extends Relation {
  constructor(modelType, key, options) {
    super()
    this.modelType = modelType
    this.key = key
    _.extend(this, options)
    if (!this.virtualIdAccessor) { this.virtualIdAccessor = naming.foreignKey(this.key) }
    if (!this.joinKey) { this.joinKey = this.foreignKey || naming.foreignKey(this.modelType.modelName) }
    if (!this.foreignKey) {
      if (this.type === 'belongsTo') this.foreignKey = `${this.key}_id`
      else this.foreignKey = this.as ? `${this.as}_id` : naming.foreignKey(this.modelType.modelName)
    }
  }

  initialize() {
    if (this._isInitialised) return
    this._isInitialised = true

    this.reverseRelation = this._findOrGenerateReverseRelation(this)

    if (!this.reverseRelation) return

    if (this.reverseModelType != null) {
      const newType = this.modelType && this.modelType.schema ? this.modelType.schema.type('id') : this.modelType
      this.reverseModelType.schema.type(this.foreignKey, newType)
    }

    if (!this.reverseRelation._isInitialised) this.reverseRelation.initialize(this)
  }

}
