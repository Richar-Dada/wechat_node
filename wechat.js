'use strict'

const crypto = require('crypto')
const https = require('https')
const util = require('util')
const accessTokenJson = require('./accessToken')
const fs = require('fs')
const menusJson = require('./menus')
const URL = require('url')
const parseString = require('xml2js').parseString
const msg = require('./msg')
 
var WeChat = function (config) {
  this.config = config
  this.token = config.token
  this.appID = config.appID
  this.appScrect = config.appScrect
  this.apiDomain = config.apiDomain
  this.apiURL = config.apiURL

  // 用于处理 https Get 请求方法
  this.requestGet = function (url) {
    return new Promise(function (resolve, reject) {
      console.log(url)
      https.get(url, function(res) {
        var buffer = []
        var result = ''
        
        res.on('data', (data) => {
          buffer.push(data)
        })

        res.on('end', () => {
          result = buffer[0].toString('utf-8')
          console.log('result')
          console.log(result)
          resolve(result)
        })
      }).on('error', function(err) {
        reject(err)
      })
    })
  }

  // 用于处理 https Post 请求方法
  this.requestPost = function(url, data) {
    return new Promise(function(resolve, reject) {
      var urlData = URL.parse(url)
      var options = {
        hostname: urlData.hostname,
        path: urlData.path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(data, 'utf-8')
        }
      }

      var req = https.request(options, function(res) {
        var buffer = []
        var result = ''

        res.on('data', (data) => {
          buffer.push(data)
        })

        res.on('end', () => {
          result = Buffer.concat(buffer).toString('utf-8')
          console.log('end')
          resolve(result)
        })
      }).on('error', (err) => {
        console.log(err)
        reject(err)
      })
      console.log('-----------')
      console.log(data)
      req.write(data)
      req.end()
    })
  }
}

WeChat.prototype.auth = function (req, res) {
  var signature = req.query.signature
  var timestamp = req.query.timestamp
  var nonce = req.query.nonce
  var echostr = req.query.echostr

  var array = [this.token, timestamp, nonce]
  array.sort()

  var tempStr = array.join('')
  const hashCode = crypto.createHash('sha1')
  var resultCode = hashCode.update(tempStr, 'utf8').digest('hex')

  if (resultCode === signature) {
    res.send(echostr)
  } else {
    res.send('mismatch')
  }

  // 创建菜单
  var that = this
  this.getAccessToken()
    .then((data) => {
      var url = util.format(that.apiURL.createMenu, that.apiDomain, data)
      console.log(url)
      console.log(menusJson)
      that.requestPost(url, JSON.stringify(menusJson)).then((data) => {
        console.log(data)
      })
    })
}

WeChat.prototype.getAccessToken = function() {
  var that = this
  return new Promise(function(resolve, reject){
    var currentTime = new Date().getTime()
    var url = util.format(that.apiURL.accessTokenApi, that.apiDomain, that.appID, that.appScrect)
    if (accessTokenJson.access_token === '' || accessTokenJson.expires_time < currentTime) {
      that.requestGet(url).then(function(data) {
        var result = JSON.parse(data)
        if (data.indexOf('errcode') < 0) {
          accessTokenJson.access_token = result.access_token
          accessTokenJson.expires_time = new Date().getTime() + (parseInt(result.expires_in) - 200) * 1000
          fs.writeFile('./accessToken.json', JSON.stringify(accessTokenJson))
          resolve(accessTokenJson.access_token)
        } else {
          resolve(result)
        }
      })
    } else {
      resolve(accessTokenJson.access_token)
    }
  })
}

/*
  微信消息
*/
WeChat.prototype.handleMsg = function(req, res) {
  var buffer = []
  req.on('data', (data) => {
    buffer.push(data)
  })

  req.on('end', () => {
    var msgXml = Buffer.concat(buffer).toString('utf-8')
    parseString(msgXml, { explicitArray: false }, (err, result) => {
      console.log('gogo')
      if (!err) {
        result = result.xml
        var toUser = result.ToUserName
        var fromUser = result.FromUserName
        console.log(result)
        switch (result.Event.toLowerCase()) {
          case 'subscribe':
            res.send(msg.txtMsg(fromUser, toUser, '欢迎欢迎！热烈欢迎～'))
            break
        }
      } else {
        console.log(err)
      }
    })
  })
}

module.exports = WeChat