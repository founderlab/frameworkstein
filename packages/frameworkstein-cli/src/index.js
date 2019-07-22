#!/usr/bin/env node

/* eslint-disable import/first */
require('babel-core/register')
require('babel-polyfill')

import program from 'commander'
import chalk from 'chalk'
import fs from 'fs'
import path from 'path'
import createProject from './commands/createProject'
import createModel from './commands/createModel'
import createSchema from './commands/createSchema'


function inCorrectDirectory() {
  return fs.existsSync(path.resolve(process.cwd(), 'client')) &&
    fs.existsSync(path.resolve(process.cwd(), 'server')) &&
    fs.existsSync(path.resolve(process.cwd(), 'shared'))
}

program
  .version('0.0.1')
  .option('-l, --verbose', 'Show more information when the command is being excecuted')
  .option('-d, --dry_run', 'A dry_run run which will only list the effected records/files')
  .option('-f, --force', 'Force')

program
  .command('add-model <name>')
  .alias('m')
  .description('Create a new model in the current app')
  .action(async name => {
    const options = {name, root: process.cwd(), force: program.force, verbose: program.verbose}

    if (!options.force && !inCorrectDirectory()) {
      return console.log(chalk.red(`This command should be run from the root directory of Frameworkstein web apps`))
    }

    console.log(`Creating model ${chalk.blue(name)} with options`, options)
    await createModel(options)
  })

program
  .command('add-models <filename>')
  .alias('schema')
  .alias('models')
  .description('Generate model files from a graphql schema definition file')
  .action(async filename => {

    const options = {filename: path.join(process.cwd(), filename), root: process.cwd(), force: program.force, verbose: program.verbose}

    if (!options.force && !inCorrectDirectory()) {
      return console.log(chalk.red(`This command should be run from the root directory of Frameworkstein web apps`))
    }

    console.log(`Creating models from file ${chalk.green(filename)} with options`, options)

    await createSchema(options)
  })

program
  .command('new-web <name>')
  .alias('new')
  .description('Create a new web app')
  .option('-t, --type', 'Type')
  .action(async name => {
    const options = {name, type: 'web', root: process.cwd(), force: program.force, verbose: program.verbose}

    console.log(`Creating new web app ${chalk.green(name)} with options`, options)

    await createProject(options)
  })

program
  .command('new-mobile <name>')
  .description('Create a new mobile app')
  .option('-t, --type', 'Type')
  .action(async name => {
    const options = {name, type: 'mobile', root: process.cwd(), force: program.force, verbose: program.verbose}

    console.log(`Creating new mobile app ${chalk.green(name)} with options`, options)

    await createProject(options)
  })


program.parse(process.argv)
