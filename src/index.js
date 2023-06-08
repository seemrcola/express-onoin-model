const http = require('http')

const Linklist = require('./linklist.js')
const RESTFUL_METHODS = ['get', 'post', 'put', 'delete']

class Express {
  constructor() {
    this.middlewares = new Linklist()
    this.registerRouter()
  }

  mountMiddleware(path, method, fn) {
    this.middlewares.append({ path, method, fn })
  }

  use(fn) {
    this.mountMiddleware(null, null, fn)
  }

  registerRouter() {
    RESTFUL_METHODS.forEach(method => {
      this[method] = (path, fn) => {
        this.mountMiddleware(path, method, fn)
      }
    })
  }

  handle(req, res, core) {
    let currentMdw = this.middlewares.head

    const next = () => {
      // 如果没有中间件了，执行洋葱最里面的core
      if(!currentMdw) return core

      const { path, method, fn } = currentMdw.element
      const income_method = req.method.toLowerCase()
      const income_path = req.url

      // 如果当前中间件的 path 为 null 表示是 use 注册的中间件
      // 如果当前中间件的 path 和 method 和 income 的一致，表示是路由中间件
      // 这两种情况都执行
      if(path === null || (path === income_path && method === income_method)){
        fn(req, res, () => {
          currentMdw = currentMdw.next
          next()  // 递归调用next
        })
      } else {
        currentMdw = currentMdw.next
        next()  // 递归调用next
      }  
    }
    next()
  }

  listen(port, fn) {
    http
    .createServer((req, res) => {
      this.handle(req, res, () => {
        res.end('404') // 洋葱最里面的代表没有匹配到路由
      })
    })
    .listen(port, () => {
      fn && fn() // 启动成功后的回调
    })
  }
}

module.exports = Express
