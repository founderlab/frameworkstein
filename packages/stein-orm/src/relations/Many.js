import _ from 'lodash'
import naming from '../lib/naming'
import Relation from './Relation'

// @nodoc
export default class Many extends Relation {
  constructor(modelType, key, options) {
    super()
    this.modelType = modelType
    this.key = key
    _.extend(this, options)
    if (!this.virtualIdAccessor) { this.virtualIdAccessor = naming.foreignKey(this.key, true) }
    if (!this.joinKey) { this.joinKey = this.foreignKey || naming.foreignKey(this.modelType.modelName) }
    if (!this.foreignKey) {
      this.foreignKey = this.as ? `${this.as}_id` : naming.foreignKey(this.modelType.modelName)
    }
    this._isInitialised = false
  }

  initialize(reverseRelation) {
    if (this._isInitialised) return
    this._isInitialised = true

    this.reverseRelation = reverseRelation || this._findOrGenerateReverseRelation()
    if (!this.reverseRelation) return

    if (this.reverseModelType != null) {
      const newType = this.modelType && this.modelType.schema ? this.modelType.schema.type('id') : this.modelType
      this.reverseModelType.schema.type(this.foreignKey, newType)
    }

    if (!this.reverseRelation._isInitialised) this.reverseRelation.initialize(this)

    if (this.reverseRelation.type === 'hasOne') {
      throw new Error(`The reverse of a hasMany relation should be \`belongsTo\`, not \`hasOne\` (${this.modelType.modelName} and ${this.reverseModelType.modelName}).`)
    }

    // check for join table
    // console.log('init check', this.modelType.modelName, this.key, this.type, '->', this.reverseRelation.type)
    if (this.reverseRelation.type === 'hasMany') {
      this.joinTable = this.findOrGenerateJoinTable(this)
    }
  }
}
