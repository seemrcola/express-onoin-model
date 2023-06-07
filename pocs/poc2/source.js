// 基于poc1版本，实现可以通过express调用的方式来产生app
function express() {
  const middlewares = []
  let mdwIndex = 0

  function handle() {
    // 获取中间件的长度
    const len = middlewares.length
    // 拿到当前中间件，并对mdwIndex进行自增
    const nextMdw = middlewares[mdwIndex++]
    // 当已经到达最后一个中间件时，就不再执行 next
    if (mdwIndex > len) return 
    // 否则执行下一个中间件
    nextMdw(() => handle())
  }

  function use(fn) {
    middlewares.push(fn)
  }

  return {
    use,
    handle,
  }
}

module.exports = express
