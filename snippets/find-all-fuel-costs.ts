import { readAllLines } from '../lib/read-lines.ts';

async function findFuelCosts(filename: string) {
  const fuelCost = (distance: number) => {
    return (1 + distance) * distance / 2;
  }

  const checkFuel = (positions: number[], target: number) => {
    return positions.reduce((acc, current) => acc + fuelCost(Math.abs(target - current)), 0);
  }

  const lines = await readAllLines(filename);

  const crabs = lines[0].split(',').map(Number);
  const sorted = crabs.sort((a, b) => a - b);
  console.log(sorted);

  const all = sorted.map(x => checkFuel(sorted, x));
  console.log(all);
}

await findFuelCosts('../day-7/input-example.txt');
