import { NumberMap } from '../lib/better-maps.ts';
import { disableConsoleLog, enableConsoleLog } from '../lib/debug.ts';
import { readLines } from '../lib/read-lines.ts';

class Polymer {
  private rules: Map<string, string>;
  private state: NumberMap<string>;
  private elements: NumberMap<string>;

  constructor(state: string) {
    this.rules = new Map();
    this.state = new NumberMap();
    this.elements = new NumberMap();

    for (let i = 0; i < state.length - 1; i++) {
      const pair = state.substr(i, 2);
      this.state.increment(pair);
    }

    for (const element of state) {
      this.elements.increment(element);
    }
  }

  addRule(pair: string, product: string) {
    this.rules.set(pair, product);
  }

  getState() {
    return this.state;
  }

  step(count = 1) {
    for (let i = 0; i < count; i++) {
      console.log(
        `Begin step ${i + 1}.    Polymer size ${[...this.state.values()].reduce(
          (acc, c) => acc + c,
          0
        )}`
      );
      this.stepActual();
      console.log(
        `Step ${i + 1} complete. Polymer size ${[...this.state.values()].reduce(
          (acc, c) => acc + c,
          0
        )}`
      );
    }
  }

  get elementsMap() {
    return this.elements;
  }

  private stepActual() {
    const nextState = new NumberMap<string>();

    for (const [pair, count] of this.state) {
      const product = this.rules.get(pair);
      if (product) {
        nextState.increment(`${pair[0]}${product}`, count);
        nextState.increment(`${product}${pair[1]}`, count);
        this.elements.increment(product, count);
      } else {
        nextState.increment(pair, count);
      }
    }

    this.state = nextState;
  }
}

async function parseInput(filename: string) {
  let polymer: Polymer;

  let parsingRules = false;
  for await (const line of readLines(filename)) {
    if (line === '') {
      parsingRules = true;
      continue;
    }

    if (parsingRules) {
      const [pair, product] = line.split(' -> ');
      polymer!.addRule(pair, product);
    } else {
      polymer = new Polymer(line);
    }
  }

  return polymer!;
}

async function findProportions(filename: string, steps: number) {
  disableConsoleLog();

  const polymer = await parseInput(filename);
  console.log(polymer);
  polymer.step(steps);
  console.log(polymer);

  const elementsByRarity = [...polymer.elementsMap.entries()].sort(
    ([, a], [, b]) => a - b
  );
  const [, mostCommon] = elementsByRarity[elementsByRarity.length - 1];
  const [, leastCommon] = elementsByRarity[0];

  enableConsoleLog();
  console.log(`Elemental disparity at ${mostCommon - leastCommon}, sir!`);
}

// await findProportions('input-example.txt', 40);
await findProportions('input.txt', 40);
