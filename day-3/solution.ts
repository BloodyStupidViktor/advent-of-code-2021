import { readAllLines } from '../lib/read-lines.ts';

function parseBinary(number: string) {
  return parseInt(number, 2);
}

function parseBitsCount(bitsCount: number[], positive: boolean) {
  const sign = positive ? 1 : -1;
  return parseBinary(bitsCount.reduce((acc, current) => `${acc}${sign * current > 0 ? 1 : 0}`, ''));
}

function countBit(bit: string) {
  return bit === '1' ? 1 : -1;
}

function getDigitsCount(lines: string[]) {
  return lines[0]?.length || 0;
}

function getBitCount(lines: string[], index: number) {
  let counter = 0;

  for (const line of lines) {
    counter += countBit(line[index]);
  }

  return counter;
}

function getBitsCount(lines: string[]) {
  const digitsCount = getDigitsCount(lines);

  const bitsCount = new Array(digitsCount).fill(0);

  for (const line of lines) {
    for (let i = 0; i < digitsCount; i++) {
      bitsCount[i] += countBit(line[i]);
    }
  }

  return bitsCount;
}

function findRating(lines: string[], mapBitCount: (bitCount: number) => string) {
  const digitsCount = getDigitsCount(lines);


  let readings = lines;

  for (let bitIndex = 0; bitIndex < digitsCount; bitIndex++) {
    const bitCount = getBitCount(readings, bitIndex);
    const expected = mapBitCount(bitCount);

    readings = readings.filter(r => r[bitIndex] === expected);

    if (readings.length <= 1) {
      break;
    }
  }

  return readings[0] ? parseBinary(readings[0]) : 0;
}

function calculatePowerConsumption(lines: string[]) {
  const bitsCounts = getBitsCount(lines);
  const gamma = parseBitsCount(bitsCounts, true);
  const epsilon = parseBitsCount(bitsCounts, false);

  const power = gamma * epsilon;

  console.log(`Power consumption reaching critical levels - ${power}, sir!`);
  return power;
}

function calculateLifeSupportRating(lines: string[]) {
  const oxygenRating = findRating(lines, bitCount => bitCount >= 0 ? '1' : '0');
  const c02Rating = findRating(lines, bitCount => bitCount < 0 ? '1' : '0');

  const lifeSupport = oxygenRating * c02Rating;

  console.log(`Life support still holding - ${lifeSupport}, sir!`);
  return lifeSupport;
}

async function getStatusReport(filename: string) {
  const lines = await readAllLines(filename);

  calculatePowerConsumption(lines);
  calculateLifeSupportRating(lines);
}

// await getStatusReport('input-example.txt');
await getStatusReport('input.txt');
