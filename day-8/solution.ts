import { readAllLines } from '../lib/read-lines.ts';
import { NumberMap } from '../lib/better-maps.ts';
import { lodash as _ } from '../deps.ts';

async function countUniqueSegmentDigits(filename: string) {
  const allLines = await readAllLines(filename);

  const result = allLines
    .map((line) => line.split(' | '))
    .map(([_, output]) => output.split(' '))
    .map((output) =>
      output.reduce(
        (count, value) => count + ([2, 3, 4, 7].includes(value.length) ? 1 : 0),
        0
      )
    )
    .reduce((total, current) => total + current, 0);

  console.log(`${result} numbers have unique segments count, sir!`);
}

const DIGITS_MAPPING: { [key: string]: string } = {
  abcefg: '0',
  cf: '1',
  acdeg: '2',
  acdfg: '3',
  bcdf: '4',
  abdfg: '5',
  abdefg: '6',
  acf: '7',
  abcdefg: '8',
  abcdfg: '9',
};
const FIXED_OCCURANCES_MAP = new Map<number, string>([
  [6, 'b'],
  [4, 'e'],
  [9, 'f'],
]);
const A_OR_C_OCCURANCES = 8;
const D_OR_G_OCCURANCES = 7;

function getSegmentsMapping(patterns: string) {
  const occurances = new NumberMap<string>(0);
  patterns
    .replace(/ /g, '')
    .split('')
    .forEach((segment) => occurances.increment(segment));

  const four = patterns.split(' ').find((x) => x.length === 4)!;

  const mapping = new Map<string, string>();

  for (const [segment, segmentOccurances] of occurances) {
    if (FIXED_OCCURANCES_MAP.has(segmentOccurances)) {
      mapping.set(segment, FIXED_OCCURANCES_MAP.get(segmentOccurances)!);
    } else if (segmentOccurances === A_OR_C_OCCURANCES) {
      mapping.set(segment, four.includes(segment) ? 'c' : 'a');
    } else if (segmentOccurances === D_OR_G_OCCURANCES) {
      mapping.set(segment, four.includes(segment) ? 'd' : 'g');
    }
  }

  return mapping;
}

function parseOutput(digits: string, segmentsMapping: Map<string, string>) {
  return Number(
    digits
      .split(' ')
      .map((digit) =>
        digit
          .split('')
          .map((digitSegment) => segmentsMapping.get(digitSegment))
          .sort()
          .join('')
      )
      .map((digit) => DIGITS_MAPPING[digit])
      .join('')
  );
}

function parseReading(line: string) {
  const [patterns, digits] = line.split(' | ');

  const segmentsMapping = getSegmentsMapping(patterns);
  const output = parseOutput(digits, segmentsMapping);
  return output;
}

async function findOutputSum(filename: string) {
  const allLines = await readAllLines(filename);

  const result = allLines
    .map((line) => parseReading(line))
    .reduce((total, current) => total + current, 0);

  console.log(
    `Intelligence reports that the sum of all readings is ${result}, sir!`
  );
}

await countUniqueSegmentDigits('input.txt');
await findOutputSum('input.txt');
