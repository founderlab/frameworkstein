const modelSaveChain = (model, results) => new Promise((resolve, reject) => {
  model.save((err, data) => {
    if (err) return reject(err)
    results.push(data)
    return resolve(results)
  })
})

module.exports = {
  modelSaveChain,
}
