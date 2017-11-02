import _ from 'lodash'
import fs from 'fs'
import path from 'path'
import cors from './cors'
import createBasicAjax from './createBasicAjax'
import render, {stripRev} from './render'
import smartSync from './smartSync'

export {cors, createBasicAjax, render, stripRev, smartSync}

const EXCLUDED_FILES = ['.DS_Store']

export function removeDirectoryAndExtension(file, directory) {
  const filename = file.replace(`${directory}/`, '')
  return filename.replace(path.extname(filename), '')
}

export function directoryFiles(directory) {
  const results = []

  function processDirectory(directory) {
    if (!fs.existsSync(directory)) return
    fs.readdirSync(directory).forEach(file => {
      if (file in EXCLUDED_FILES) return

      const pathedFile = path.join(directory, file)
      const stat = fs.statSync(pathedFile)
      // a directory, process
      if (stat.isDirectory()) {
        processDirectory(pathedFile)
      }
      else {
         // a file, add to results
        results.push(pathedFile)
      }
    })
  }

  processDirectory(directory)
  return results
}

export function directoryModules(directory) {
  const results = {}
  directoryFiles(directory).forEach(file => {
    try {
      results[removeDirectoryAndExtension(file, directory)] = require(file)
    }
    catch (err) {
      console.log(err)
    }
  })
  return results
}

// Find all modules in a directory that have a class or function as their default export
export function directoryFunctionModules(directory) {
  const allModules = directoryModules(directory)
  const functionModules = {}
  _.keys(allModules).forEach(file => {
    const module = allModules[file].default ? allModules[file].default : allModules[file]
    if (_.isFunction(module)) functionModules[file] = module
  })
  return functionModules
}
