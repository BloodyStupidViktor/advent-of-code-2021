import { readAllLines } from '../lib/read-lines.ts';

class FuelChecker {
  private positions: number[];
  private cache: Map<number, number>;

  constructor(input: number[]) {
    this.positions = input.sort((a, b) => a - b);
    this.cache = new Map<number, number>();
  }

  checkFuel(position: number) {
    if (this.cache.has(position)) {
      return this.cache.get(position) as number;
    }

    const fuel = this.positions.reduce((acc, current) => acc + this.fuelCost(Math.abs(position - current)), 0);
    this.cache.set(position, fuel);
    return fuel;
  }

  search() {
    const minPosition = this.positions[0];
    const maxPosition = this.positions[this.positions.length - 1];
    const startingPosition = Math.floor((maxPosition - minPosition) / 2);

    return this.binarySearch(minPosition, startingPosition, maxPosition);
  }

  private fuelCost(distance: number) {
    return (1 + distance) * distance / 2;
  }

  private binarySearch(minPosition: number, currentPosition: number, maxPosition: number): number {
    const leftPositionCost = this.checkFuel(currentPosition - 1);
    const currentPositionCost = this.checkFuel(currentPosition);
    const rightPositionCost = this.checkFuel(currentPosition + 1);

    if (leftPositionCost < currentPositionCost) {
      return this.binarySearch(minPosition, Math.floor((currentPosition + minPosition) / 2), currentPosition);
    }
    if (rightPositionCost < currentPositionCost) {
      return this.binarySearch(currentPosition, Math.floor((maxPosition + currentPosition) / 2), maxPosition);
    }

    console.log(`Found lowest cost ${currentPositionCost} at position ${currentPosition}`);
    return currentPositionCost;
  }
}

async function findBestPosition(filename: string) {
  const lines = await readAllLines(filename);

  const initialPositions = lines[0].split(',').map(Number);

  const fuelChecker = new FuelChecker(initialPositions);
  const cost = fuelChecker.search();
  console.log(cost);
}

// await findBestPosition('input-example.txt');
await findBestPosition('input.txt');
