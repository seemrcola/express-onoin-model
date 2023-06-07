const express = require('express')
const app = express()
const port = 3000

// poc1部分的实现核心--------------------------------------------
// 时间中间件
const requestTime = (req, res, next) => {
  req.requestTime = Date.now()
  console.log('first middleware start')
  next()
  console.log('first middleware end')
}
// 信息中间件
const logger = (req, res, next) => {
  req.log = 'logger'
  console.log('second middleware start')
  next()
  console.log('second middleware end')
}
// 使用中间件
app.use(requestTime)
app.use(logger)
// poc1部分的实现核心----------------------------------------------

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
