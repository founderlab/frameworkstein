import expect from 'expect'
import { observeStore } from '../src'

describe('observeStore', () => {

  it('Calls onChange when the store updates', done => {

    class Store {
      constructor(state) {
        this.state = state
      }

      getState = () => this.state

      subscribe = fn => this.subscribeFn = fn

      setState = state => {
        this.state = state
        this.subscribeFn()
      }
    }

    const firstState = 'default state'
    const secondState = 'new state'
    const select = state => state
    const store = new Store(firstState)

    let calls = 0
    const onChange = newState => {
      ++calls
      if (calls === 1) {
        expect(newState).toEqual(firstState)
      }
      else if (calls === 2) {
        expect(newState).toEqual(secondState)
        done()
      }
    }

    observeStore(store, select, onChange)
    store.setState(secondState)

  })
})
