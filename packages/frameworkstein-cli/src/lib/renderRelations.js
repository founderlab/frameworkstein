

export default function renderRelations(relations) {
  if (!relations) return ''
  return relations.map(relation => `${relation.name}: () => ['${relation.relationType}', require('./${relation.modelType}')],\n`).join('')
}
