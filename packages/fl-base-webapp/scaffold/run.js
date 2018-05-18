require('babel-core/register')()

const script = `./${process.argv[2] || 'development'}.js`
console.log('Running', script)

require(script)(err => {
  if (err) console.trace(err)
  console.log('done')
  process.exit(0)
})
