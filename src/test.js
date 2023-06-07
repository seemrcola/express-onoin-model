const express = require('./index.js')

const app = new express()

// 时间中间件
const requestTime = (res, req, next) => {
  console.log('first middleware start')
  res.time = Date.now()
  next()
  console.log('first middleware end', res.time)
}
// 信息中间件
const logger = (res, req, next) => {
  console.log('second middleware start')
  res.log = 'logger'
  next()
  console.log('second middleware end', res.log)
}
// 使用中间件
app.use(requestTime)
app.use(logger)

// 启动
app.listen('localhost', 3000, () => {
  console.log('--core--')
})
