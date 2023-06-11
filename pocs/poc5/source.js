// const http = require('http')

// var express={
// 	mws:[]
// }
// const mountMW = (path,method,fn)=>{
// 	express.mws.push({path,method,fn})
// }
// express.use = fn=>{
// 	mountMW(null,null,fn)
// }
// express.handle = (req,res,fn)=>{
// 	let idx = 0
// 	let len = express.mws.length
// 	const income_path = req.url
// 	const income_method = req.method.toLowerCase()
// 	const next = ()=>{
// 		if(idx<len){
// 			let mw = express.mws[idx++]
// 			if(mw.path==null||(mw.path==income_path&&mw.method==income_method)){
// 				mw.fn(req,res,next);
// 			}else{
// 				next(req,res,next)
// 			}
// 		}else{
// 			fn()
// 		}
// 	}
// 	next()
// }
// ['post','get','put','delete'].forEach(method=>{
// 	express[method] = (path,fn)=>{
// 		mountMW(path,method,fn)
// 	}
// })
// express.listen = port=>{
// 	var port = 3000
// 	const server = http.createServer((req,res)=>{
// 		express.handle(req,res,()=>{res.end('404')})
// 	}).listen(port,()=>{
// 		console.log(`Server start on port ${port}.....`,3000)
// 	})
// }
// module.exports = express

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
      // 拿到当前中间件的信息
      const { path, method, fn } = middlewares[mdwIndex++]
      // income 的信息
      const income_method = req.method.toLowerCase()
      const income_path = req.url

      if(mdwIndex < length) {
        // 如果当前中间件的 path 为 null 表示是 use 注册的中间件
        // 如果当前中间件的 path 和 method 和 income 的一致，表示是路由中间件
        // 这两种情况都执行
        // 否则跳过当前中间件
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
        res.end('404') // 洋葱最里面的代表没有匹配到路由
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
