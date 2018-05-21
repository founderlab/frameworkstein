import _ from 'lodash'

export default function parseJson(json, schema) {
  let value

  for (var key in schema.fields) {
    let needle
    value = schema.fields[key]
    if (schema.fields[key] && (schema.fields[key].type === 'Boolean') && (json[key] !== null)) {
      json[key] = !!json[key]
    }
    else if (((value.type != null ? value.type.toLowerCase() : undefined) === 'json') && json[key] && _.isString(json[key])) {
      try {
        json[key] = JSON.parse(json[key])
      }
      catch (err) {}
      // console.log(err)
    }
    else if ((needle = value.type != null ? value.type.toLowerCase() : undefined, ['float', 'decimal'].includes(needle)) && json[key] && _.isString(json[key])) {
      json[key] = +json[key]
    }
  }

  // Make join table ids strings
  for (key in json) {
    value = json[key]
    if (key.endsWith('_id') && value) {
      json[key] = value.toString()
    }
  }

  // Make primary key and foreign keys strings
  if (json.id) { json.id = json.id.toString() }
  for (key in schema.relations) {
    let foreignKey
    const relation = schema.relations[key]
    if (relation.type === 'belongsTo') {
      ({ foreignKey } = relation)
    }
    if (foreignKey && json[foreignKey]) {
      json[foreignKey] = json[foreignKey].toString()
    }
  }

  return json
}
