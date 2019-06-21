import Inflection from 'inflection'


export default function generateNames(name) {
  const names = {
    className: Inflection.classify(name),
    tableName: Inflection.tableize(name),
    variableName: Inflection.camelize(name, true),
  }
  names.variablePlural = Inflection.pluralize(names.variableName)
  names.classPlural = Inflection.pluralize(names.className)
  names.actionName = names.tableName.toUpperCase()
  return names
}
