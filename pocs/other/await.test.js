// 嵌套 await 测试
// Path: src/await.test.js
const axios = require('axios')

function async1() {
  console.log('async1 start')
  async2()
  console.log('async1 end')
}

async function async2() {
  console.log('async2 start')
  await async3()
  console.log('async2 end')
}

async function async3() {
  console.log('async3 start')
  await axios.get('https://www.baidu.com')
  console.log('async3 end')
}

console.log('script start')

async1()

// script start
// async1 start
// async2 start
// async3 start
// async1 end
// async3 end
// async2 end

// 这个结果相当奇怪，本来我以为应该是这样的：
// script start
// async1 start
// async2 start
// async3 start
// async3 end
// async2 end
// async1 end

// 这个不符合直觉的结果可能是由于v8的优化导致的，具体原因还需要深入研究
// 总之 express 中使用异步中间件，很可能无法得到预期结果。
