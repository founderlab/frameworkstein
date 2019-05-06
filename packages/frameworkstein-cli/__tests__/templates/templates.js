
import fs from 'fs'
import path from 'path'

const modelOptions = {
  className: 'TestModel',
  classPlural: 'TestModels',
  tableName: 'test_models',
  variableName: 'testModel',
  variablePlural: 'testModels',
  actionName: 'TEST_MODEL',
}

const allModelOptions = {
  modelOptions: [modelOptions],
}

describe('Templates', () => {

  function testTemplate(templatePath, options=modelOptions) {
    const template = require(`../../src/templates/${templatePath}`)
    const expectedOutput = fs.readFileSync(path.resolve(__dirname, `./checkfiles/${templatePath}.js`), 'utf8')
    const output = template(options)
    expect(output).toEqual(expectedOutput)
  }

  /*
   * Server
   */
  it('Creates a valid controller template ', () => {
    testTemplate('server/controller')
  })

  it('Creates a valid server model template ', () => {
    testTemplate('server/model')
  })

  it('Creates a valid controller template template', () => {
    testTemplate('server/template')
  })

  /*
   * Shared
   */
  it('Creates a valid admin template', () => {
    testTemplate('shared/configureAdmin', allModelOptions)
  })

  it('Creates a valid shared model template', () => {
    testTemplate('shared/model')
  })

  it('Creates a valid schema template', () => {
    testTemplate('shared/schema')
  })

  it('Creates a valid actions template', () => {
    testTemplate('shared/module/actions')
  })

  it('Creates a valid reducer template', () => {
    testTemplate('shared/module/reducer')
  })

  it('Creates a valid selectors template', () => {
    testTemplate('shared/module/selectors')
  })

  /*
   * Components
   */
})
