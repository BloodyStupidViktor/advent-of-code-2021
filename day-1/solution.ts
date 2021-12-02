import { path } from '../deps.ts';
import { readNumbers } from '../lib/read-lines.ts';

const filename = path.join(Deno.cwd(), 'input.txt');

const sum = (...arr: number[]) => [...arr].reduce((acc, val) => acc + val, 0);

async function countIndividualDips() {
  let counter = 0;
  let prev = null;

  for await (const current of readNumbers(filename)) {
    if (prev != null && current > prev) {
      counter++;
    }

    prev = current;
  }

  console.log(`${counter} measurements are larger than the previous measurement`);
  return counter;
}

async function countSumDips() {
  let counter = 0;
  let [a, b, c]: Array<number | null> = [null, null, null];

  for await (const current of readNumbers(filename)) {
    if (a != null && b != null && c != null && sum(b, c, current) > sum(a, b, c)) {
      counter++;
    }

    [a, b, c] = [b, c, current];
  }

  console.log(`${counter} sums are larger than the previous sum`);
  return counter;
}

await countIndividualDips();
await countSumDips();
