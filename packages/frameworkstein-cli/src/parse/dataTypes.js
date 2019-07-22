export function isCustomObject(type) {
  return ![
    'Text',
    'Integer',
    'DateTime',
  ].includes(type)
}

export function translateType(type) {
  let result
  switch (type) {
    case 'String':
      result = 'Text'
      break
    case 'Int':
      result = 'Integer'
      break
    case 'Date':
      result = 'Datetime'
      break
    default:
      result = type.charAt(0).toUpperCase() + type.slice(1)
  }
  return result
}
