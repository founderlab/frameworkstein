import fs from 'fs'
import https from 'https'
import unzip from 'unzip'
import rimraf from 'rimraf'
import Queue from 'queue-async'

function replaceString(fileName, oldStr, newStr, callback) {
  fs.access(fileName, fs.W_OK|fs.R_OK, err => {
    if (err) return callback(new Error(`String replacement failure: ${err}`))

    fs.readFile(fileName, (err, data) => { //read old file
      if (err) return callback(new Error(`String replacement failure: ${err}`))
      const txt = data.toString()
      const replacedTxt = txt.replace(oldStr, newStr)

      fs.writeFile(fileName+'_tmp', replacedTxt, err => { //write tmp file
        if (err) return callback(new Error(`String replacement failure: ${err}`))

        fs.unlink(fileName, err => { //delete old file
          if (err) return callback(new Error(`String replacement failure: ${err}`))

          fs.rename(fileName+'_tmp', fileName, err => { // rename tmp file
            if (err) return callback(new Error(`String replacement failure: ${err}`))
            return callback(null)
          })
        })
      })
    })
  })
}

export default function newApp(_options, _callback) {

  const options = {
    ..._options,
  }

  const repoName = options.type === 'mobile' ? 'fl-base-mobile-app' : 'fl-base-webapp'
  const repoZipUrl = `https://codeload.github.com/founderlab/${repoName}/zip/master`

  const zipFilename = `${repoName}.zip`
  const oldFolder = `${repoName}-master`
  const newFolder = options.name
  const writer = fs.createWriteStream(zipFilename)
  const replace = [
    {filePath: `${newFolder}/shared/modules/app/containers/Navbar.js`, name: options.name},
    {filePath: `${newFolder}/package.json`, name: options.name},
    {filePath: `${newFolder}/.env`, name: options.name.toLowerCase().replace(/\W/g, '_')},
  ]

  function callback(err) {
    const queue = new Queue()

    queue.defer(callback => { // delete zip
      fs.access(zipFilename, fs.F_OK, err => {
        if (err) return callback(err)
        fs.unlink(zipFilename, err => {
          if (err) return callback(err)
          if (options.verbose) console.log('--Zip deleted.')
          callback(null)
        })
      })
    })

    queue.defer(callback => { // delete old folder
      fs.access(oldFolder, fs.F_OK, err => {
        if (err) {// err means successfully renamed
          return callback(null)
        } // otherwise delete the old folder
        rimraf(oldFolder, err => {
          if (err) return callback(err)
          if (options.verbose) console.log('--Folder ' + oldFolder + ' deleted.')
          callback(new Error('Failed when renaming '+ oldFolder + ' to ' + newFolder + ', ' + newFolder + ' already exists.'))
        })
      })
    })

    if (err && err.message === `String replacement failure: ${err}`) {
      queue.defer(callback => { // delete new folder
        fs.access(newFolder, fs.F_OK, err => {
          if (err) return callback(err) // otherwise delete the old folder
          rimraf(newFolder, err => {
            if (err) return callback(err)
            if (options.verbose) console.log('--Folder ' + newFolder + ' deleted.')
            callback(new Error('Failed when modifying .env or package.json.'))
          })
        })
      })
    }

    queue.await(_callback)
  }

  // download, unzip, rename
  https.get(repoZipUrl, res => {
    res.on('data', d => writer.write(d))

    res.on('end', () => {
      if (options.verbose) console.log('--Zip downloaded.')
      const stream = fs.createReadStream(zipFilename).pipe(unzip.Extract({path: './'}))

      stream.on('close', () => {
        if (options.verbose) console.log('--Zip extracted to folder '+ oldFolder + '.')

        fs.rename(oldFolder, newFolder, err => {
          if (err) return callback(err)
          if (options.verbose) console.log('--Folder renamed to '+ newFolder + '.')
          const queue = new Queue()

          // Set the app name in a few files
          replace.forEach(({filePath, name}) => {
            queue.defer(callback => {
              replaceString(filePath, /FounderLab_replaceme/g, name, err => {
                if (err) return callback(err)
                if (options.verbose) console.log('--' + filePath + ' modified.')
                callback()
              })
            })
          })

          queue.await(callback)
        })
      })
    })
  })

}
