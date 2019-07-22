import generateFolderStructure from '../generate/generateFolderStructure'

export default async function createProject(options) {
  await generateFolderStructure(options)
}
