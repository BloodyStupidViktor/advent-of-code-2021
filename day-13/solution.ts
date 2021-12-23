import { readLines } from '../lib/read-lines.ts';

class Origami {
  width: number;
  height: number;

  private dots: Set<string>;

  constructor() {
    this.width = 0;
    this.height = 0;
    this.dots = new Set();
  }

  addDot(x: number, y: number) {
    this.width = Math.max(this.width, x + 1);
    this.height = Math.max(this.height, y + 1);

    this.dots.add(`${x},${y}`);
  }

  get dotsCount() {
    return this.dots.size;
  }

  fold([axis, foldAt]: Instruction) {
    switch (axis) {
      case 'x':
        this.foldVertically(foldAt);
        break;
      case 'y':
        this.foldHorizontally(foldAt);
        break;
    }
  }

  foldHorizontally(foldAt: number) {
    this.height = (this.height - 1) / 2;

    const nextDots = new Set<string>();

    for (const dot of this.dots) {
      const [x, y] = dot.split(',').map(Number);
      if (y < foldAt) {
        nextDots.add(dot);
      } else if (y > foldAt) {
        nextDots.add(`${x},${2 * foldAt - y}`);
      }
    }

    this.dots = nextDots;
  }

  foldVertically(foldAt: number) {
    this.width = (this.width - 1) / 2;

    const nextDots = new Set<string>();

    for (const dot of this.dots) {
      const [x, y] = dot.split(',').map(Number);
      if (x < foldAt) {
        nextDots.add(dot);
      } else if (x > foldAt) {
        nextDots.add(`${2 * foldAt - x},${y}`);
      }
    }

    this.dots = nextDots;
  }

  print() {
    const printo = Array.from({ length: this.height }, () =>
      Array.from({ length: this.width }, () => '.')
    );

    for (const dot of this.dots) {
      const [x, y] = dot.split(',').map(Number);
      printo[y][x] = '#';
    }

    for (const row of printo) {
      console.log(row.join(''));
    }
  }
}

type Instruction = [string, number];
async function parseInput(filename: string): Promise<[Origami, Instruction[]]> {
  const instructionOffset = 'fold along '.length;
  const origami = new Origami();
  const instructions: Instruction[] = [];

  let parsingInstructions = false;
  for await (const line of readLines(filename)) {
    if (line === '') {
      parsingInstructions = true;
      continue;
    }

    if (parsingInstructions) {
      const [axis, value] = line.substring(instructionOffset).split('=');
      instructions.push([axis, Number(value)]);
    } else {
      const [x, y] = line.split(',').map(Number);
      origami.addDot(x, y);
    }
  }

  return [origami, instructions];
}

async function countDots(filename: string) {
  const [origami, instructions] = await parseInput(filename);

  for (const instruction of instructions) {
    origami.fold(instruction);
  }

  console.log(`Origami has ${origami.dotsCount} dots, sir!`);
  origami.print();
}

// await countDots('input-example.txt');
await countDots('input.txt');
