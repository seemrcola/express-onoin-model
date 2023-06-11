顺便复习一下async await的实现

生成器函数
```js
function* gen() {
  yield 1
  yield 2
  yield 3
}
const g = gen()
console.log(g.next()) // { value: 1, done: false }
console.log(g.next()) // { value: 2, done: false }
console.log(g.next()) // { value: 3, done: false }
console.log(g.next()) // { value: undefined, done: true }
```

含有return的情况
```js
function* gen() {
  yield 1
  yield 2
  yield 3
  return 4
}
const g = gen()
console.log(g.next()) // { value: 1, done: false }
console.log(g.next()) // { value: 2, done: false }
console.log(g.next()) // { value: 3, done: false }
console.log(g.next()) // { value: 4, done: true }
```
yeild后面是函数
```js
function fn(num) {
  return num
}
function* gen() {
  yield fn(1)
  yield fn(2)
  return 3
}
const g = gen()
console.log(g.next()) 
// { value: 1, done: false }
console.log(g.next())
//  { value: 2, done: false }
console.log(g.next()) 
// { value: 3, done: true }
```
yeild后面是promise
```js
function fn(num) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(num)
    }, 1000)
  })
}
function* gen() {
  yield fn(1)
  yield fn(2)
  return 3
}
const g = gen()
console.log(g.next()) // { value: Promise { <pending> }, done: false }
console.log(g.next()) // { value: Promise { <pending> }, done: false }
console.log(g.next()) // { value: 3, done: true }
```
我们实现一个类似co模块的东西，来把异步和generator结合起来
```js
function co(gen) {
  return new Promise((resolve, reject) => {
    const g = gen()
    function next(data) {
      const { value, done } = g.next(data)
      if(done) {
        resolve(value)
      } else {
        Promise.resolve(value).then(next, reject)
      }
    }
    next()
  })
}
// 测试
function fn(num) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(num)
    }, 1000)
  })
}
function* gen() {
  const a = yield fn(1)
  const b = yield fn(2)
  const c = yield fn(3)
  return a + b + c
}
co(gen).then(res => {
  console.log(res) // 6
})
```
co函数的实现原理就是不断调用next方法，直到done为true，然后返回value。如果value是promise，就调用then方法，把next方法作为回调传进去，如果value不是promise，就直接调用next方法。

async await和这个实现类似。


