import { io } from '../deps.ts';

export async function* readLines(filename: string) {
  const fileReader = await Deno.open(filename);
  for await (const line of io.readLines(fileReader)) {
    yield line;
  }
}

export async function* readNumbers(filename: string) {
  for await (const line of readLines(filename)) {
    yield Number(line);
  }
}

// TODO: Refactor!
export async function readAllLines(filename: string) {
  const result: string[] = [];
  for await (const line of readLines(filename)) {
    result.push(line);
  }
  return result;
}
