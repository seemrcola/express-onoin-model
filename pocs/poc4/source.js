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

  function listen(port, core) {
    let res = {}
    let req = {}
    handle(res, req, core)
  }

  app.use = use
  app.listen = listen
  return app
}

module.exports = express
