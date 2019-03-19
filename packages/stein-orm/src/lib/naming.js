import inflection from 'inflection'


export default class NamingConvention {
  static modelName(tableName, plural) {
    return inflection[plural ? 'pluralize' : 'singularize'](inflection.classify(tableName))
  }

  static tableName(modelName) {
    return inflection.pluralize(inflection.underscore(modelName))
  }

  static foreignKey(modelName, plural) {
    if (plural) {
      return inflection.singularize(inflection.camelize(modelName, true)) + '_ids'
    }
    return inflection.camelize(modelName, true) + '_id'
  }

  static foreignKeySingular(modelName, plural) {
    if (plural) {
      return inflection.singularize(inflection.camelize(modelName, true)) + '_ids'
    }
    return inflection.singularize(inflection.camelize(modelName, true)) + '_id'
  }

  static attribute(modelName, plural) {
    return inflection[plural ? 'pluralize' : 'singularize'](inflection.camelize(modelName, true))
  }
}
