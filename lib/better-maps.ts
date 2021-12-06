export class BetterMap<K, V> extends Map<K, V> {
  constructor(private defaultValue: V) {
    super();
  }

  get(key: K): V {
    return super.get(key) || this.defaultValue;
  }
}

export class NumberMap<K> extends BetterMap<K, number> {
  constructor(defaultValue = 0) {
    super(defaultValue);
  }

  increment(key: K, value = 1) {
    this.set(key, this.get(key) + value);
  }
}
