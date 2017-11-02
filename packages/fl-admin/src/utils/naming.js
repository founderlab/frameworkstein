import Inflection from 'inflection'

export function plural(Model) {
  return Inflection.pluralize(Model.name)
}

export function upper(Model) {
  return Inflection.underscore(Model.name).toUpperCase()
}

export function table(Model) {
  return Inflection.tableize(Model.name)
}

export function label(key) {
  return  Inflection.humanize(Inflection.underscore(key))
}
