const Linklist = require('./linklist.js')

class Express {
  constructor() {
    this.middlewares = new Linklist()
  }

  handle(req, res, core) {
    let currentMdw = this.middlewares.head
    const next = () => {
      if (currentMdw) {
        currentMdw.element(req, res, () => {
          currentMdw = currentMdw.next
          next()  // 递归调用next
        })
      } else {
        core()  // 执行洋葱的最里面
      }
    }
    next()
  }

  listen(host, port, core) {
    let res = {}
    let req = {}
    this.handle(req, res, core)
  }

  use(fn) {
    this.middlewares.append(fn)
  }
}

module.exports = Express
