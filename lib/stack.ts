export class Stack<T> extends Array<T> {
  peek() {
    return this[this.length - 1];
  }
}
