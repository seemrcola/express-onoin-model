const express = require('./source.js')

const app = express()

// 时间中间件
const requestTime = (next) => {
  console.log('first middleware start')
  next()
  console.log('first middleware end')
}
// 信息中间件
const logger = (next) => {
  console.log('second middleware start')
  next()
  console.log('second middleware end')
}
// 使用中间件
app.use(requestTime)
app.use(logger)

// 启动
app.handle()



