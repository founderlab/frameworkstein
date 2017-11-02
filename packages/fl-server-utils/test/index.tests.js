import _ from 'lodash'
import expect from 'expect'
import {removeDirectoryAndExtension, directoryFiles, directoryFunctionModules} from '../src'

describe('index functions', () => {

  it('removeDirectoryAndExtension alters a string correctly', () => {
    expect(removeDirectoryAndExtension('dir/models/something.js', 'dir/models')).toEqual('something')
  })

  it('directoryFiles gives a list of paths as strings', () => {
    const files = directoryFiles(__dirname)
    expect(files).toBeAn('array')
    files.forEach(file => {
      expect(file).toBeA('string')
    })
  })

  it('directoryFunctionModules provides an object containing require-d modules that are functions', () => {
    const modules = directoryFunctionModules(`${__dirname}/../src`)
    expect(modules).toBeAn('object')
    _.forEach(modules, mod => {
      expect(mod).toBeA('function')
    })
  })

})

