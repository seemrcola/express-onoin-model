// 基于poc1版本，实现可以通过express调用的方式来产生app
function express() {
  const middlewares = []

  function handle(res, req, core) {
    let mdwIndex = 0
    let length = middlewares.length
    const next = () => {
      if(mdwIndex < length)  
        middlewares[mdwIndex++](res, req, next) // 执行下一个middleware
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
