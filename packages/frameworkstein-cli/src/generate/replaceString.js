/* eslint-disable no-bitwise */
import fs from 'fs'
import { promisify } from 'util'


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

export default promisify(replaceString)
