import expect from 'expect'
import { selectModule } from '../src/smartSync'

const MONGO_DATABASE_URL = 'mongodb://localhost:27017/fl-test'

const SQL_URLS = [
  'pg://localhost:5432/fl-test',
  'postgres://localhost:5432/fl-test',
  'sqlite://localhost:5432/fl-test',
  'sqlite3://localhost:5432/fl-test',
  'mysql://localhost:5432/fl-test',
  'mysql2://localhost:5432/fl-test',
]

const HTTP_URLS = [
  '/localhost:5432/fl-test',
  '//localhost:5432/fl-test',
  'http://localhost:5432/fl-test',
  'https://localhost:5432/fl-test',
]

const OTHER_URLS = [
  'fl-test',
  'memory://localhost:5432/fl-test',
]

const BAD_URLS = [
  null,
  '',
]

describe('smartSync', () => {

  it('Requires the correct sync ', () => {
    SQL_URLS.forEach(url => {
      expect(selectModule(url)).toEqual('fl-backbone-sql')
    })
    HTTP_URLS.forEach(url => {
      expect(selectModule(url)).toEqual('backbone-http')
    })
    OTHER_URLS.forEach(url => {
      expect(selectModule(url)).toEqual('backbone-orm')
    })
    BAD_URLS.forEach(url => {
      expect(selectModule(url)).toNotExist()
    })
    expect(selectModule(MONGO_DATABASE_URL)).toEqual('backbone-mongo')
  })

})
