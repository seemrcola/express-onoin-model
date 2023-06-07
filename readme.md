### EXPRESS 

#### 1. express中间件
根据express的features, 我们可以实现自己的express框架  
首先是基础用法, 通过express创建一个http服务, 并监听3000端口
```js
const express = require('express')
const app = express()
const port = 3000

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

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
```
我们在`/pocs/poc1/express.js`中写入上面这段代码，看看效果:
```js
// 打开浏览器, 访问localhost:3000，node控制台打印如下
Example app listening on port 3000
first middleware start
second middleware start
second middleware end
first middleware end
```
那我们现在就了解了中间件执行的机制，接下来实现这个功能
```js
// 首先我们看到express的demo都需要传一个next进来，然后在中间件里面调用next，这样就可以实现中间件的串联了。
// 那我们也实现一个这样的方案

const express = {
  middlewares: [],
  mdwIndex: 0,
}

express.use = function (fn) {
  express.middlewares.push(fn)
}

express.handle = function () {
  // 获取中间件的长度
  const len = express.middlewares.length
  // 拿到当前中间件，并对mdwIndex进行自增
  const nextMdw = express.middlewares[express.mdwIndex++]
  // 当已经到达最后一个中间件时，就不再执行 next
  if (express.mdwIndex > len) return 
  // 否则执行下一个中间件
  nextMdw(() => express.handle())
}

module.exports = express
```
这里的测试写在`/pocs/poc1/poc.js`中，可以前往进行debugger调试，看看中间件的执行顺序。  
当然我们现在和express还有点区别，我们无法通过express()来调用。
我们稍微改一下。  
在pc2中，我用express函数包裹了一层，然后返回，来实现app = express()这样的调用方式。  

#### 2. express.listen
我们现在可以通过express()来调用了，但是还有一个问题，就是我们无法通过app.listen来启动服务。  
我们通过listen来开启中间件这个并不复杂，我们只需要将express.handle写进express.listen即可。  
同时我们要支持req和res两个参数的传入（当前我们只支持了next参数传入）
```js
// 基于poc1版本，实现可以通过express调用的方式来产生app
function express() {
  const middlewares = []

  function handle(res, req, core) {
    let mdwIndex = 0
    let length = middlewares.length
    const next = () => {
      if(mdwIndex < length) 
        middlewares[mdwIndex++](res, req, next) 
      else 
        core() // 执行洋葱的最里面
    }
    next()
  }

  function listen(host, port, core) {
    let res = {}
    let req = {}
    handle(res, req, core)
  }

  function use(fn) {
    middlewares.push(fn)
  }

  return {
    use,
    listen
  }
}

module.exports = express
```
在 /pocs/poc3中哟组合部分代码和测试代码。可以额看到我们优化了handle的写法，变得更加好懂。  
之前我们的`nextMdw(() => handle)`这个写法还是有点绕，现在我们直接调用`middlewares[mdwIndex++](res, req, next)` ,更加清晰.  
简单来说就是用next再包一层，清晰化语义。

#### 3. express路由



