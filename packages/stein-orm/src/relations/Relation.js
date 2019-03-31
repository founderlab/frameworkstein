import _ from 'lodash'
// import Model from '../Model'
import naming from '../lib/naming'


// @nodoc
export default class Relation {

  hasJoinTable() { return !!this.joinTable || (this.reverseRelation && !!this.reverseRelation.joinTable) }
  isManyToMany() { return this.type === 'hasMany' && this.reverseRelation && this.reverseRelation.type === 'hasMany' }

  findOrGenerateJoinTable() {
    // already exists
    const joinTable = this.joinTable || this.reverseRelation.joinTable
    if (joinTable) return joinTable

    this.joinTable = this.reverseRelation.joinTable = this.modelType.schema.generateJoinTable(this)
    return this.joinTable
  }

  _findOrGenerateReverseRelation() {
    const { modelType, reverseModelType } = this

    if (!reverseModelType) {
      // console.dir(this)
      console.log(`[florm] Could not find reverse model type on relation ${this.modelType.modelName} ${this.type} ${this.key}`)
      return
    }

    let reverseRelation = reverseModelType.schema.relation(this.as)
    // if (reverseRelation && (reverseRelation._isInitialised || reverseRelation._isInitialising)) return reverseRelation
    if (!reverseRelation) reverseRelation = reverseModelType.schema.relation(naming.attribute(modelType.modelName, false)) // singular
    if (!reverseRelation) reverseRelation = reverseModelType.schema.relation(naming.attribute(modelType.modelName, true)) // plural

    if (reverseRelation) reverseRelation.reverseRelation = this
    return reverseRelation
  }
}
