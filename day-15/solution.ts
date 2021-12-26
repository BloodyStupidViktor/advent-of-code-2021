import { readLines } from '../lib/read-lines.ts';
import { disableConsoleLog, enableConsoleLog } from '../lib/debug.ts';

class Dud {
  totalCost: number;
  parent?: string;

  constructor(public position: string, public cost: number) {
    this.totalCost = Infinity;
  }
}

class Duda {
  width: number;
  height: number;
  private duds: Map<string, Dud>;

  constructor() {
    this.width = 0;
    this.height = 0;
    this.duds = new Map();
  }

  add(x: number, y: number, value: number) {
    this.width = Math.max(this.width, x + 1);
    this.height = Math.max(this.height, y + 1);

    const position = `${x},${y}`;
    this.duds.set(position, new Dud(position, value));
  }

  fivify() {
    const fivified = new Map<string, Dud>();
    const times = 5;

    for (const dud of this.duds.values()) {
      const [x, y] = dud.position.split(',').map(Number);

      for (let i = 0; i < times; i++) {
        for (let j = 0; j < times; j++) {
          const newCost = dud.cost + i + j;
          const newDud = new Dud(
            `${x + this.width * i},${y + this.height * j}`,
            newCost > 9 ? newCost - 9 : newCost
          );
          fivified.set(newDud.position, newDud);
        }
      }
    }

    this.duds = fivified;
    this.width *= times;
    this.height *= times;
  }

  dudestPath() {
    const visited = new Set<string>();
    const unvisited = new Set(this.duds.values());

    const startPos = '0,0';
    const start = this.duds.get(startPos)!;
    start.totalCost = 0;

    const endPos = `${this.width - 1},${this.height - 1}`;

    const isDone = () =>
      visited.has(endPos) || closestUnvisited()?.totalCost === Infinity;

    const closestUnvisited = () =>
      [...unvisited].reduce((acc, current) =>
        acc.totalCost < current.totalCost ? acc : current
      );

    const unvisitedAdjacent = (dud: Dud) =>
      this.adjacent(dud.position)
        .filter((adjPos) => !visited.has(adjPos))
        .map((adjPos) => this.duds.get(adjPos)!);

    while (!isDone()) {
      const current = closestUnvisited();
      console.log(current);

      for (const adj of unvisitedAdjacent(current)) {
        console.log(`Evaluating`, adj);
        const costThroughCurrent = current.totalCost + adj.cost;
        console.log(`costThroughCurrent`, costThroughCurrent);
        if (costThroughCurrent < adj.totalCost) {
          adj.totalCost = costThroughCurrent;
          adj.parent = current.position;
          console.log(`Better, updated`, adj);
        } else {
          console.log(
            `Couldn't update ${adj.position}/${adj.totalCost} from ${current.position}/${current.totalCost}`
          );
        }
      }

      visited.add(current.position);
      unvisited.delete(current);
    }

    return this.duds.get(endPos)!;
  }

  print() {
    const printo = Array.from({ length: this.height + 4 }, () =>
      Array.from({ length: this.width + 4 }, () => '.')
    );

    for (const dud of this.duds.values()) {
      const [x, y] = dud.position.split(',').map(Number);
      const shiftoX = x + Math.floor(x / 10);
      const shiftoY = y + Math.floor(y / 10);
      printo[shiftoY][shiftoX] = `${dud.cost}`;
    }

    for (const row of printo) {
      console.log(row.join(''));
    }
  }

  private adjacent(position: string) {
    const [x, y] = position.split(',').map(Number);
    return [
      `${x + 1},${y}`,
      `${x},${y + 1}`,
      `${x - 1},${y}`,
      `${x},${y - 1}`,
    ].filter((adj) => this.duds.has(adj));
  }
}

async function parseInput(filename: string) {
  const duda = new Duda();

  let y = 0;
  for await (const line of readLines(filename)) {
    line
      .split('')
      .map(Number)
      .forEach((v, x) => duda.add(x, y, v));
    y++;
  }

  return duda;
}

async function findSafestPath(filename: string) {
  const duda = await parseInput(filename);

  disableConsoleLog();
  duda.fivify();
  const dudestPath = duda.dudestPath();
  duda.print();
  console.log(dudestPath);
  enableConsoleLog();
  console.log(`Lowest total risk ${dudestPath.totalCost}, sir!`);
}

// await findSafestPath('input-example.txt');
await findSafestPath('input.txt');
