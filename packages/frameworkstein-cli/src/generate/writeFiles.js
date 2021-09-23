import mkdirp from 'mkdirp'
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import { promisify } from 'util'


const writeFileAsync = promisify(fs.writeFile)


export async function writeFile(out, options) {
  if (!options.force && fs.existsSync(out.path)) {
    throw new Error(`File already exists at ${out.path}. Use --force to overwrite`)
  }
  await mkdirp(path.dirname(out.path))

  console.log(' ', chalk.green('Creating file:'), out.path)
  if (options.verbose) {
    console.log('---------------------')
    console.log(chalk.yellow(out.content))
    console.log('---------------------')
  }

  await writeFileAsync(out.path, out.content)
}

export default async function writeFiles(output, options) {
  for (const out of output) {
    await writeFile(out, options)
  }
}
