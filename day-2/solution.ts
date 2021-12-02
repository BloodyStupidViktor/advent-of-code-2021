import { path } from '../deps.ts';
import { readLines } from '../lib/read-lines.ts';

const filename = path.join(Deno.cwd(), 'input.txt');

const FORWARD_COMMAND = 'forward';
const DOWN_COMMAND = 'down';
const UP_COMMAND = 'up';

function parseCommand(command: string): [string, number] {
  const [type, value] = command.split(' ');
  return [type, Number(value)];
}

async function calculatePosition() {
  let position = 0;
  let depth = 0;

  for await (const command of readLines(filename)) {
    const [type, value] = parseCommand(command);

    switch(type) {
      case FORWARD_COMMAND:
        position += value;
        break;
      case DOWN_COMMAND:
        depth += value;
        break;
      case UP_COMMAND:
        depth -= value;
        break;
      default:
        console.warn(`Unknown command ${type}, sir!`);
    }
  }

  console.log(`Reporting position ${position} at depth ${depth} with launch code ${position * depth}, sir!`)
}

async function calculateAimedPosition() {
  let position = 0;
  let depth = 0;
  let aim = 0;

  for await (const command of readLines(filename)) {
    const [type, value] = parseCommand(command);

    switch(type) {
      case FORWARD_COMMAND:
        position += value;
        depth += aim * value;
        break;
      case DOWN_COMMAND:
        aim += value;
        break;
      case UP_COMMAND:
        aim -= value;
        break;
      default:
        console.warn(`Unknown command ${type}, sir!`);
    }
  }

  console.log(`Reporting position ${position} at depth ${depth} with launch code ${position * depth}, sir!`)
}

await calculatePosition();
console.log('Rescind order!');
await calculateAimedPosition();
console.log('Better be right this time!');
