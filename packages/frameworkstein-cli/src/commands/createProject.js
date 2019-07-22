import generateFolderStructure from '../generate/generateFolderStructure'

export default async function createProject(options) {
  console.log('createProject', options)
  await generateFolderStructure(options)
  console.log('created folder structure')
}
