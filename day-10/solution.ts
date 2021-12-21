import { readLines } from '../lib/read-lines.ts';
import { Stack } from '../lib/stack.ts';

const OpeningBracketsList = '([{<';
const ClosingBracketsMap: {
  [key: string]: { opening: string; score: number };
} = {
  ')': { opening: '(', score: 3 },
  ']': { opening: '[', score: 57 },
  '}': { opening: '{', score: 1197 },
  '>': { opening: '<', score: 25137 },
};

function parseLine(line: string) {
  const stack = new Stack<string>();

  for (const char of line) {
    if (OpeningBracketsList.includes(char)) {
      stack.push(char);
    } else {
      const top = stack.peek();

      if (!top || top !== ClosingBracketsMap[char].opening) {
        return -ClosingBracketsMap[char].score;
      }

      stack.pop();
    }
  }

  return stack.reduceRight(
    (acc, current) => acc * 5 + OpeningBracketsList.indexOf(current) + 1,
    0
  );
}

async function parseInput(filename: string) {
  let syntaxErrorScore = 0;
  const autocompleteScores = [];
  for await (const line of readLines(filename)) {
    const score = parseLine(line);
    if (score < 0) {
      syntaxErrorScore -= score;
    } else {
      autocompleteScores.push(score);
    }
  }

  const autocompleteScoresSorted = autocompleteScores.sort((a, b) => a - b);
  const autocompleteScore =
    autocompleteScoresSorted[Math.floor(autocompleteScoresSorted.length / 2)];

  console.log(`Total syntax error score ${syntaxErrorScore}, sir!`);
  console.log(`Total autocomplete score ${autocompleteScore}, sir!`);
}

// await parseInput('input-example.txt');
await parseInput('input.txt');
