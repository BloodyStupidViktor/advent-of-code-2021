class IterableClass {
  [Symbol.iterator]() {
    return {
      next() {
        return {
          value: null,
          done: true,
        };
      }
    };
  }
}

const iterable = new IterableClass();

for (const i of iterable) {
  console.log(i);
}
