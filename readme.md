### EXPRESS 
#### 补
src下会写一个总体实现，代码上会比poc测试代码完善一点点，但是思路是一样的。  
比如src下我使用的是链表而不是数组，但是整体代码并不比数组更好懂，整体还是以poc代码思路为主。  
主要代码以及注释都在poc文件中，readme只是一个总结。

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

  function listen(port, core) {
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
实际上express的路由也是中间件，只不过是在中间件中做了一层判断，如果匹配到了路由，就执行路由的回调，否则就执行next。  
基于这个思路，我们也做个处理。  
测试代码在poc4，我们可以调整中间件use的位置，来观察打印的情况。  
测试方式
1. node express.js
2. 查看控制台
3. 访问localhost:3000
4. 查看控制台
```js
// 基于poc1版本，实现可以通过express调用的方式来产生app

const RESTFUL_METHODS = ['get', 'post', 'put', 'delete', 'options', 'head', 'patch']

function express() {
  const app = {}

  const middlewares = []

  function use(fn) {
    mountMiddleware( path = undefined, fn )
  }

  function handle(res, req, core) {
    let mdwIndex = 0
    let length = middlewares.length
    const next = () => {
      if(mdwIndex < length)  
        middlewares[mdwIndex++].fn(res, req, next) // 执行middleware
      else 
        core() // 执行洋葱的最里面
    }
    next()
  }

  function mountMiddleware(path, fn) {
    // 由于我们要顺便把path放进去，所以我们需要一个对象来存储
    middlewares.push({path, fn})
  }

  // 既然路由也是中间件，那我们在调用路由的时候就执行挂载
  RESTFUL_METHODS.forEach(method => {
    app[method] = (path, fn) => {
      mountMiddleware(path, fn)
    }
  })

  function listen(host, port, core) {
    let res = {}
    let req = {}
    handle(res, req, core)
  }

  app.use = use
  app.listen = listen
  return app
}

module.exports = express
```
我们将restful的方法挂载到app上，然后在调用的时候，就执行挂载。  
但是我们poc4还无法真正跑起来，因为我们并没有实现一个http服务，所以我们需要引入http模块来实现一个http服务。  
```js
const http = require('http')

const RESTFUL_METHODS = ['get', 'post', 'put', 'delete']

function express() {
  const app = {}
  const middlewares = []

  function use(fn) {
    mountMiddleware(null, null, fn)
  }

  RESTFUL_METHODS.forEach(method => {
    app[method] = (path, fn) => {
      mountMiddleware(path, method, fn)
    }
  })

  function mountMiddleware(path, method, fn) {
    middlewares.push({ path, method, fn })
  }

  function handle(req, res, core) {
    let mdwIndex = 0
    let length = middlewares.length
    const next = () => {
      const { path, method, fn } = middlewares[mdwIndex++]
      const income_method = req.method.toLowerCase()
      const income_path = req.url

      if(mdwIndex < length) {
        if(path === null || (path === income_path && method === income_method)) 
          fn(req, res, next)
        else 
          next() // 跳过当前中间件
      } 
      else {
        core() // 执行洋葱的最里面
      }
        
    }
    next()
  }

  function listen(port, fn) {
    http.createServer((req, res) => {
      handle(req, res, () => {
        res.end('404')
      })
    }).listen(port, () => {
      fn && fn() // 启动成功后的回调
    })
  }

  app.use = use
  app.listen = listen

  return app
}

module.exports = express
```
!!当前src下的代码还停留在router之前，后续会补上。
!!一些代码还需要debug，后续会补上。


