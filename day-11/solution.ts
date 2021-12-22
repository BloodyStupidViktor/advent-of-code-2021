import { disableConsoleLog, enableConsoleLog } from '../lib/debug.ts';
import { readAllLines } from '../lib/read-lines.ts';

class Octopus {
  static ZeroEnergy = 0;
  static FlashEnergy = 9;

  private adjacent: Set<Octopus>;
  private hasFlashed: boolean;

  constructor(public x: number, public y: number, public energy: number) {
    this.adjacent = new Set();
    this.hasFlashed = false;
  }

  addAdjacent(other: Octopus) {
    this.adjacent.add(other);
  }

  increaseEnergy() {
    this.energy++;

    const willFlash = !this.hasFlashed && this.energy > Octopus.FlashEnergy;
    return willFlash;
  }

  flash() {
    if (this.hasFlashed) {
      return false;
    }

    this.hasFlashed = true;

    return [...this.adjacent.values()].filter((o) => o.increaseEnergy());
  }

  cleanup() {
    if (this.hasFlashed) {
      this.hasFlashed = false;
      this.energy = Octopus.ZeroEnergy;
    }
  }
}

class OctopusesField {
  private octopuses: Map<string, Octopus>;
  private flashesCount: number;
  private elapsed: number;

  constructor(initial: number[][]) {
    this.octopuses = new Map();
    this.flashesCount = 0;
    this.elapsed = 0;

    for (let y = 0; y < initial.length; y++) {
      for (let x = 0; x < initial[y].length; x++) {
        this.octopuses.set(`${x},${y}`, new Octopus(x, y, initial[y][x]));
      }
    }

    for (const octopus of this.octopuses.values()) {
      for (let ax = octopus.x - 1; ax <= octopus.x + 1; ax++) {
        for (let ay = octopus.y - 1; ay <= octopus.y + 1; ay++) {
          if (ax === octopus.x && ay === octopus.y) {
            continue;
          }

          const adjacent = this.octopuses.get(`${ax},${ay}`);
          if (adjacent) {
            octopus.addAdjacent(adjacent);
          }
        }
      }
    }
  }

  get totalFlashes() {
    return this.flashesCount;
  }

  get totalElapsed() {
    return this.elapsed;
  }

  step(count = 1) {
    return [...Array(count)]
      .map(() => this.stepActual())
      .reduce((acc, current) => acc + current, 0);
  }

  private stepActual() {
    console.log(`=== BEGIN STEP ${this.totalElapsed} ===`);
    const octopuses = [...this.octopuses.values()];
    const flashing = octopuses.filter((o) => o.increaseEnergy());
    if (flashing.length > 0) {
      console.log(
        `Marked for flashing after initial increase: ${flashing
          .map((o) => `${o.x},${o.y}`)
          .join('; ')} +`
      );
      this.print('+', ...flashing);
    }
    const flashed = [];

    while (flashing.length > 0) {
      const next = flashing.pop()!;
      const flashResult = next.flash();
      this.flashesCount++;
      flashed.push(next);
      console.log(`Flashing ${next.x},${next.y} *`);
      this.print('*', next);
      const newFlashing =
        flashResult && flashResult.filter((f) => !flashing.includes(f));
      if (newFlashing && newFlashing.length > 0) {
        console.log(
          `Marking for flashing: ${newFlashing
            .map((o) => `${o.x},${o.y}`)
            .join('; ')} +`
        );
        this.print('+', ...newFlashing);
        flashing.push(...newFlashing);
      }
    }

    for (const octopus of this.octopuses.values()) {
      octopus.cleanup();
    }

    console.log(`==== END STEP ${this.totalElapsed} ====`);

    this.print();

    console.log(`==== END STEP ${this.totalElapsed} ====`);

    this.elapsed++;

    return flashed.length;
  }

  print(highlightSymbol?: string, ...octopusesToHighlight: Octopus[]) {
    const fieldMap: number[][] = [];
    [...this.octopuses.values()].forEach((o) => {
      fieldMap[o.y] = fieldMap[o.y] || [];
      fieldMap[o.y][o.x] = o.energy;
    });

    console.log(
      `*x ${Array(10)
        .fill(0)
        .map((_, i) => `${i}   `)
        .join('')}`
    );

    const highlight = (x: number, y: number) =>
      octopusesToHighlight.some((o) => o.x === x && o.y === y)
        ? highlightSymbol
        : ' ';

    fieldMap
      .map((row, y) =>
        row
          .map((i, x) =>
            i < 10 ? ` ${i}${highlight(x, y)}` : `${i}${highlight(x, y)}`
          )
          .join(' ')
      )
      .forEach((x, i) => console.log(`${i} ${x}`));
  }

  printCompact() {
    const fieldMap: number[][] = [];
    [...this.octopuses.values()].forEach((o) => {
      fieldMap[o.y] = fieldMap[o.y] || [];
      fieldMap[o.y][o.x] = o.energy;
    });
    console.log(fieldMap.map((x) => x.join('')).join('\n'));
  }
}
async function parseInput(filename: string) {
  const lines = await readAllLines(filename);
  const initial = lines.map((line) => line.split('').map(Number));
  return new OctopusesField(initial);
}

async function countFlashes(filename: string, steps: number) {
  const field = await parseInput(filename);

  disableConsoleLog();
  field.step(steps);
  enableConsoleLog();

  console.log(field.totalFlashes);
}

async function findFlashBomb(filename: string) {
  const field = await parseInput(filename);

  disableConsoleLog();
  while (field.step() !== 100) {}
  enableConsoleLog();

  console.log(field.totalElapsed);
}

// await countFlashes('input-example.txt', 100);
await countFlashes('input.txt', 100);
await findFlashBomb('input.txt');
