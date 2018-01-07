'use strict'

const crypto = require('crypto')
const https = require('https')
const util = require('util')
const accessTokenJson = require('./accessToken')
const fs = require('fs')

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

module.exports = WeChat