import _ from 'lodash'
import expect from 'expect'
import render, {stripRev} from '../src/render'

describe('render', () => {

  it('stripRev removes all _rev properties', () => {
    const obj = [{
      _rev: 1,
      sub: {
        _rev: 2,
        something: new Date(),
      },
    }, {
      _rev: 1,
      sub: {
        _rev: 2,
      },
    }]

    const stripped = stripRev(obj)

    expect(stripped[0]._rev).toNotExist()
    expect(stripped[1]._rev).toNotExist()
    expect(stripped[0].sub._rev).toNotExist()
    expect(stripped[1].sub._rev).toNotExist()
  })

  it('render renders a raw template', done => {

    const rawJson = [
      {name: 'think'},
      {name: 'thunk'},
      {name: 'thank'},
    ]

    const template = (models, options, callback) => {
      models.forEach(m => {
        m.checked = true
        m._rev = 1
      })
      callback(null, models)
    }
    template.$raw = true

    const req = {
      query: {$template: 'show'},
    }

    class Renderer {
      constructor(opts={}) {
        _.extend(this, opts)
        this.templates = {show: template}
        this.render = render.bind(this)
      }
    }

    const renderer = new Renderer()

    renderer.render(req, rawJson, (err, json) => {
      expect(err).toNotExist()
      expect(json).toBeAn('array')
      expect(json.length).toBe(rawJson.length)
      json.forEach(obj => {
        expect(obj.checked).toBe(true)
        expect(obj._rev).toNotExist()
      })
      done()
    })

  })

})
