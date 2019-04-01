import _ from 'lodash'
import naming from '../lib/naming'
import Relation from './Relation'

// @nodoc
export default class Many extends Relation {
  constructor(modelType, key, options) {
    super()
    this.modelType = modelType
    this.key = key
    this._initialOptions = options
    _.extend(this, options)

    if (!this.virtualIdAccessor) {
      this.virtualIdAccessor = naming.foreignKey(this.key, true)
    }

    if (!this.foreignKey) {
      this.foreignKey = naming.foreignKey(this.as || this.modelType.modelName)
    }

    if (!this.joinKey) {
      this.joinKey = this.foreignKey
    }

    this._isInitialised = false
  }

  // Update foreign key and join key to the correct ones for a m2m table
  setManyToManyKeys() {
    if (!this._initialOptions.foreignKey) this.foreignKey = naming.foreignKeySingular(this.as || this.modelType.modelName)
    if (!this._initialOptions.joinKey) this.joinKey = this.foreignKey
  }

  initialise(reverseRelation) {
    if (this._isInitialised || this._isInitialising) return
    this._isInitialising = true

    if (reverseRelation) {
      this.reverseRelation = reverseRelation
      this.reverseModelType = reverseRelation.modelType
    }
    else if (this.reverseModelType) {
      this.reverseRelation = this._findOrGenerateReverseRelation(this)
      if (!this.reverseRelation) return
    }
    else {
      this._isInitialising = false
      return
    }

    const newType = this.modelType && this.modelType.schema ? this.modelType.schema.type('id') : this.modelType
    this.reverseModelType.schema.type(this.foreignKey, newType)

    if (!this.reverseRelation._isInitialised) this.reverseRelation.initialise(this)

    if (this.reverseRelation.type === 'hasOne') {
      throw new Error(`The reverse of a hasMany relation should be \`belongsTo\`, not \`hasOne\` (${this.modelType.modelName} and ${this.reverseModelType.modelName}).`)
    }
    // check for join table
    if (this.reverseRelation.type === 'hasMany') {

      if (this.modelType === this.reverseRelation.modelType) {
        if (!this.as || !this.reverseRelation.as) throw new Error(`Many to Many relations to the same model require an \`as\` option (${this.modelType.modelName} and ${this.reverseModelType.modelName}).`)
      }

      this.setManyToManyKeys()
      this.reverseRelation.setManyToManyKeys()

      this.joinTable = this.findOrGenerateJoinTable(this)
    }

    this._isInitialising = false
    this._isInitialised = true
  }

}
