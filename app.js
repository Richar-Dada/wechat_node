const express = require('express')
const crypto = require('crypto')
const config = require('./config')

const app = express()

app.get('/', (req, res) => {

  var signature = req.query.signature
  var timestamp = req.query.timestamp
  var nonce = req.query.nonce
  var echostr = req.query.echostr

  var array = [config.token, timestamp, nonce]
  array.sort()

  var tempStr = array.join('')
  const hashCode = crypto.createHash('sha1')
  var resultCode = hashCode.update(tempStr, 'utf8').digest('hex')

  if (resultCode === signature) {
    res.send(echostr)
  } else {
    res.send('mismatch')
  }
})

app.listen(3000, () => {
  console.log('server is running')
})