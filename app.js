
const express = require('express')
const wechat = require('./wechat')
const config = require('./config')

const app = express()

const wechatApp = new wechat(config)

app.get('/', (req, res) => {
  wechatApp.auth(req,res)
  
})

app.get('/getAccessToken', (req, res) => {
  wechatApp.getAccessToken()
    .then((data) => {
      res.send(data)
    })
    .catch((err) => {
      console.log('error: ' + err)
    })
})

app.post('/', (req, res) => {
  wechatApp.handleMsg(req, res)
})

process.on('unhandledRejection', function (err, p) {
  console.error('catch exception:',err.stack)
});

app.listen(3000, () => {
  console.log('server is running')
})