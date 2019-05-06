#! /usr/bin/env babel-node

import program from 'commander'
import chalk from 'chalk'
import fs from 'fs'
import path from 'path'

program
  .version('0.0.1')
  .option('-l, --verbose', 'Show more information when the command is being excecuted')
  .option('-d, --dry_run', 'A dry_run run which will only list the effected records/files')
  .option('-f, --force', 'Force')

program
  .command('add-model <name>')
  .alias('m')
  .description('Create a new model in the current app')
  .action(name => {
    const options = {name, root: process.cwd(), force: program.force, verbose: program.verbose}

    // if (
    //   !options.force && (
    //   !fs.existsSync(path.resolve(process.cwd(), 'client')) ||
    //   !fs.existsSync(path.resolve(process.cwd(), 'server')) ||
    //   !fs.existsSync(path.resolve(process.cwd(), 'shared')))) {
    //   return console.log(chalk.red(`This command should be run from the root directory of FounderLab web apps`))
    // }

    console.log(`Creating model ${chalk.blue(name)} with options`, options)
    require('./commands/createModel')(options, err => {
      if (err) return console.log(chalk.red(err.message))
      console.log(chalk.green('done'))
    })
  })

program
  .command('new-web <name>')
  .alias('new')
  .description('Create a new web app')
  .option('-t, --type', 'Type')
  .action(name => {
    const options = {name, type: 'web', root: process.cwd(), force: program.force, verbose: program.verbose}

    console.log(`Creating new web app ${chalk.green(name)} with options`, options)

    require('./commands/new')(options, err => {
      if (err) return console.log(chalk.red(err.message))
      console.log(chalk.green('done'))
    })

  })

program
  .command('new-mobile <name>')
  .description('Create a new mobile app')
  .option('-t, --type', 'Type')
  .action(name => {
    const options = {name, type: 'mobile', root: process.cwd(), force: program.force, verbose: program.verbose}

    console.log(`Creating new mobile app ${chalk.green(name)} with options`, options)

    require('./commands/new')(options, err => {
      if (err) return console.log(chalk.red(err.message))
      console.log(chalk.green('done'))
    })

  })


program.parse(process.argv)
