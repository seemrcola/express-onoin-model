const express = require('./source.js')
const axios = require('axios')

const app = express()
// 时间中间件
const requestTime = (req, res, next) => {
  console.log('first middleware start')
  res.time = Date.now()
  next()
  console.log('first middleware end', res.time)
}
// 信息中间件
const logger = async (req, res, next) => {
  console.log('second middleware start')
  res.log = 'logger'
  await next()
  console.log('second middleware end', res.log)
}
// 异步中间件
const asyncMiddleware = async (req, res, next) => {
  console.log('async middleware start')
  await axios.get('https://www.baidu.com')
  next()
  console.log('async middleware end')
}

// app.get('/user',(req,res,next)=>{
//   console.log('user route start')
// 	res.end('get /user')
//   console.log('user route end')
// })

// app.post('/user',(req,res,next)=>{
//   console.log('user route start')
// 	res.end('post /user')
//   console.log('user route end')
// })

app.use(requestTime)
app.use(logger)
app.use(asyncMiddleware)

app.get('/user',(req,res,next)=>{
  console.log('user route start', res.sync)
	res.end('get /user')
  console.log('user route end')
})

app.post('/user',(req,res,next)=>{
  console.log('user route start', res.sync)
	res.end('post /user')
  console.log('user route end')
})

app.listen(3088)
