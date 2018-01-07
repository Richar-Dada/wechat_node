const express = require('express')
const crypto = require('crypto')
const config = require('./config')

const app = express()

app.get('/', (req, res) => {
  res.send('Hello Node.js')
})

app.listen(3000)