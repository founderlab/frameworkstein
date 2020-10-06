/* eslint-disable no-use-before-define */
import _ from 'lodash'


// TODO: look at optimizing without left outer joins everywhere
// Make another query to get the complete set of relation objects when they have been fitered by a where clause
function joinToRelation(query, relation, options={}) {
  let fromKey
  let toKey
  const { modelType } = relation
  const relationModelType = relation.reverseModelType

  const fromTable = modelType.tableName
  let toTable = relationModelType.tableName
  const asTableName = options.asTableName

  if ((relation.type === 'hasMany') && (relation.reverseRelation.type === 'hasMany')) {
    const pivotTable = relation.joinTable.tableName

    // Join the from model to the pivot table
    fromKey = `${fromTable}.id`
    const pivotToKey = `${pivotTable}.${relation.foreignKey}`
    query.leftOuterJoin(pivotTable, fromKey, '=', pivotToKey)

    if (!options.pivotOnly) {
      // Then to the to model's table (only if we need data from them second table)
      const pivotFromKey = `${pivotTable}.${relation.reverseRelation.foreignKey}`
      toKey = `${asTableName || toTable}.id`
      if (asTableName) toTable = `${toTable} as ${asTableName}`

      return query.leftOuterJoin(toTable, pivotFromKey, '=', toKey)
    }

  }
  else {
    if (relation.type === 'belongsTo') {
      fromKey = `${fromTable}.${relation.foreignKey}`
      toKey = `${toTable}.id`
    }
    else {
      fromKey = `${fromTable}.id`
      toKey = `${toTable}.${relation.foreignKey}`
    }
    return query.leftOuterJoin(toTable, fromKey, '=', toKey)
  }
}

function appendRelatedWhere(query, condition, options={}) {
  let fromKey
  let select

  const fromModelType = condition.relation.modelType
  const table = condition.modelType.tableName

  if (condition.relation.type === 'belongsTo') {
    fromKey = `${fromModelType.tableName}.${condition.relation.reverseRelation.foreignKey}`
    select = `${condition.relation.reverseModelType.tableName}.id`
  }
  else {
    fromKey = `${fromModelType.tableName}.id`
    select = condition.relation.reverseRelation.foreignKey
  }

  const inMethod = (condition.method === 'orWhere' || condition.method === 'orWhereIn') ? 'orWhereIn' : 'whereIn'

  if (condition.operator) {
    return query[inMethod](fromKey, builder => {
      if (!_.isUndefined(condition.value)) {
        return builder.select(select).from(table)[condition.method](condition.key, condition.operator, condition.value)
      }
      else if (condition.dotWhere) {
        builder.select(select).from(table)
        return appendRelatedWhere(builder, condition.dotWhere, options)
      }
    })

  }

  return query[inMethod](fromKey, builder => {
    if (!_.isUndefined(condition.value)) {
      return builder.select(select).from(table)[condition.method](condition.key, condition.value)
    }
    else if (condition.dotWhere) {
      builder.select(select).from(table)
      return appendRelatedWhere(builder, condition.dotWhere, options)
    }
    else if (condition.conditions && condition.conditions.length) {
      builder.select(select).from(table)
      appendWhere(builder, condition)
      return builder
    }
    return builder.select(select).from(table)[condition.method](condition.key)
  })
}

function appendNestedRelatedWhere(query, condition, options={}) {
  let idKey
  let selectKey
  const sourceTable = condition.relation.modelType.tableName
  const relatedTable = condition.modelType.tableName

  if (condition.relation.type === 'belongsTo') {
    idKey = `${sourceTable}.${condition.relation.foreignKey}`
    selectKey = 'id'
  }
  else {
    idKey = `${sourceTable}.id`
    selectKey = condition.relation.reverseRelation.foreignKey
  }

  // console.log('condition.ast.where', condition.ast.where)
  return query.whereIn(idKey, builder => {
    builder.select(selectKey).from(relatedTable)
    appendWhere(builder, condition.ast.where, options)
    return builder
  })
}

function appendWhere(query, condition, options={}) {

  // console.log('condition', condition)
  if (condition.ast) {
    appendNestedRelatedWhere(query, condition, options)
  }
  else if (!_.isUndefined(condition.key) || condition.dotWhere) {

    if (condition.relation) {
      if ((condition.relation.type === 'hasMany') && (condition.relation.reverseRelation.type === 'hasMany')) {

        const fromModelType = condition.relation.modelType
        const relationModelType = condition.relation.reverseModelType

        const fromTable = fromModelType.tableName
        const toTable = relationModelType.tableName
        const pivotTable = condition.relation.joinTable.tableName

        const fromKey = `${fromTable}.id`
        const pivotToKey = `${pivotTable}.${condition.relation.foreignKey}`

        const pivotFromKey = `${pivotTable}.${condition.relation.reverseRelation.foreignKey}`

        if (condition.operator) {
          query.whereIn(fromKey, builder => {
            return builder.select(pivotToKey).from(pivotTable).whereIn(pivotFromKey, builder2 => {
              return builder2.select('id').from(toTable)[condition.method](condition.key, condition.operator, condition.value)
            })
          })
        }
        else {
          query.whereIn(fromKey, builder => {
            return builder.select(pivotToKey).from(pivotTable).whereIn(pivotFromKey, builder2 => {
              return builder2.select('id').from(toTable)[condition.method](condition.key, condition.value)
            })
          })
        }

      }
      else {
        appendRelatedWhere(query, condition, options)
      }
    }
    else if (condition.operator) {
      query[condition.method](condition.key, condition.operator, condition.value)
    }
    else {
      query[condition.method](condition.key, condition.value)
    }
  }
  else if (condition.conditions && condition.conditions.length) {
    query[condition.method](builder => condition.conditions.forEach(c => appendWhere(builder, c)))
  }

  return query
}

function appendSelect(query, ast) {
  query.select(ast.select)
  return query
}

function appendSort(query, ast) {
  if (!ast.sort) return query

  for (const sort of ast.sort) {
    query.orderBy(sort.column, sort.direction)
  }

  return query
}

function appendLimits(query, limit, offset) {
  if (limit) { query.limit(limit) }
  if (offset) { query.offset(offset) }
  return query
}

export default function buildQueryFromAst(query, ast, options={}) {
  appendWhere(query, ast.where)

  let hasInclude = false

  _.forEach(ast.joins, join => {
    const joinOptions = {
      pivotOnly: join.pivotOnly && !(join.include || join.condition),
      asTableName: join.asTableName,
    }
    joinToRelation(query, join.relation, joinOptions)
    if (join.include) {
      hasInclude = true
    }
  })

  if (ast.count || options.count) return query.count('*')
  if (ast.exists || options.exists) return query.count('*').limit(1)

  if (!hasInclude) appendLimits(query, ast.limit, ast.offset) //does not apply limit and offset clauses for queries with $include
  if (!options.skipSelect) appendSelect(query, ast)
  appendSort(query, ast)

  return query
}
