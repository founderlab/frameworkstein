import _ from 'lodash'
import Queue from 'queue-async'
import fs from 'fs'
import path from 'path'
import cors, { addCORSHeaders } from './cors'


export { cors, addCORSHeaders }

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

export function directoryFilesAsync(directory, callback) {
  const results = []

  fs.exists(directory, (exists) => {
    // if (err) return callback(err)
    if (!exists) return callback(null, results)

    fs.readdir(directory, (err, files) => {
      if (err) return callback(err)

      const q = new Queue()
      files.forEach(file => {
        if (file in EXCLUDED_FILES) return

        q.defer(callback => {
          const pathedFile = path.join(directory, file)
          fs.stat(pathedFile, (err, stat) => {
            if (err) return callback(err)
            // a directory, process
            if (stat.isDirectory()) {
              directoryFilesAsync(pathedFile, (err, nestedResults) => {
                if (err) return callback(err)
                results.push.apply(results, nestedResults)
                callback()
              })
            }
            else {
              // a file, add to results
              results.push(pathedFile)
              callback()
            }
          })
        })
      })
      q.await(err => callback(err, results))
    })
  })
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

export function directoryModulesAsync(directory, callback) {
  const results = {}
  directoryFilesAsync(directory, (err, files) => {
    if (err) return callback(err)
    files.forEach(file => {
      try {
        results[removeDirectoryAndExtension(file, directory)] = require(file)
      }
      catch (err) {
        console.log(err)
      }
    })
    callback(null, results)
  })
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

// Find all modules in a directory that have a class or function as their default export
export function directoryFunctionModulesAsync(directory, callback) {
  directoryModulesAsync(directory, (err, allModules) => {
    if (err) return callback(err)

    const functionModules = {}
    _.keys(allModules).forEach(file => {
      const module = allModules[file].default ? allModules[file].default : allModules[file]
      if (_.isFunction(module)) functionModules[file] = module
    })

    callback(null, functionModules)
  })
}
