// 首先我们看到express的demo mdw 都需要传一个next进来，然后在中间件里面调用next，这样就可以实现中间件的串联了。
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
