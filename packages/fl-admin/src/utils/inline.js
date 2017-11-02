export const NO_LIST_EDIT = ['hasMany', 'manyToMany']

export function shouldEditFieldInline(field) {
  return field && field.listEdit && !field.hidden && NO_LIST_EDIT.indexOf(field.type) === -1
}

export function shouldDisplayFieldInline(field) {
  return field && field.listDisplay && !field.hidden
}
