// 实现一个单向链表
class Node {
  constructor(element) {
    this.element = element
    this.next = null
  }
}

class Linklist {
  constructor() {
    this.head = null
    this.length = 0
  }

  // 向链表尾部添加一个元素
  append(element) {
    const node = new Node(element)
    if (this.head === null) {
      this.head = node
    } 
    else {
      let current = this.head
      while (current.next) {
        current = current.next
      }
      current.next = node
    }
    this.length++
  }

  // 向链表的特定位置插入一个元素
  insert(position, element) {
    if (position < 0 || position > this.length) return false
    const node = new Node(element)
    if (position === 0) {
      node.next = this.head
      this.head = node
    }
    else {
      let current = this.head
      let previous = null
      let index = 0
      while (index++ < position) {
        previous = current
        current = current.next
      }
      previous.next = node
      node.next = current
    }
    this.length++
    return true
  }

  // 从链表中移除一个元素
  remove(element) {
    const index = this.indexOf(element)
    return this.removeAt(index)
  }

  // 返回元素在链表中的索引，如果链表中没有该元素则返回-1
  indexOf(element) {
    let current = this.head
    let index = 0
    while (current) {
      if (current.element === element) {
        return index
      }
      index++
      current = current.next
    }
    return -1
  }

  // 从链表的特定位置移除一个元素
  removeAt(position) {
    if (position < 0 || position >= this.length) return null
    let current = this.head
    if (position === 0) {
      this.head = current.next
    } 
    else {
      let previous = null
      let index = 0
      while (index++ < position) {
        previous = current
        current = current.next
      }
      previous.next = current.next
    }
    this.length--
    return current.element
  }

  // 如果链表中不包含任何元素，返回true
  isEmpty() {
    return this.length === 0
  }

  // 返回链表包含的元素个数
  size() {
    return this.length
  }

  // 返回链表的头元素
  getHead() {
    return this.head
  }
}

module.exports = Linklist
