import { readAllLines } from '../lib/read-lines.ts';
import { NumberMap } from '../lib/better-maps.ts';

async function countLanternfishSilly(filename: string, days: number) {
  const lines = await readAllLines(filename);

  let fishes = lines[0].split(',').map(Number);
  console.log(fishes);

  for (let i = 0; i < days; i++) {
    fishes = fishes.flatMap(timer => timer === 0 ? [6, 8] : [timer - 1]);
  }

  console.log(fishes.length);
}

class SchoolOfFish {
  private map: NumberMap<number>;

  constructor(input: number[]) {
    this.map = new NumberMap();

    for (const timer of input) {
      this.map.increment(timer);
    }
  }

  passDay() {
    const nextDay = new NumberMap<number>();

    for (const [timer, count] of this.map) {
      if (timer === 0) {
        nextDay.increment(8, count);
        nextDay.increment(6, count);
      } else {
        nextDay.increment(timer - 1, count);
      }
    }

    this.map = nextDay;
  }

  countFishes() {
    return [...this.map].reduce((acc, [_, count]) => acc + count, 0);
  }
}

async function countLanternfish(filename: string, days: number) {
  const lines = await readAllLines(filename);

  const fishes = lines[0].split(',').map(Number);

  const school = new SchoolOfFish(fishes);

  for (let i = 0; i < days; i++) {
    school.passDay();
  }

  console.log(`There will be ${school.countFishes()} fishes on day ${days}, sir!`);
}

// await countLanternfish('input-example.txt', 80);
await countLanternfish('input.txt', 80);
await countLanternfish('input.txt', 256);
