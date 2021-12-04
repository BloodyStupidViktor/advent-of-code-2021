import { readAllLines } from '../lib/read-lines.ts';

type BingoCell = [number, boolean];
type BingoRowOrColumn = BingoCell[];

class BingoBoard {
  static SIZE = 5;

  cells: BingoCell[];
  hasBingo: boolean;

  private lastMarked: number | null;

  constructor(numbers: number[]) {
    this.cells = numbers.map((number) => [number, false]);
    this.hasBingo = false;
    this.lastMarked = null;
  }

  mark(calledNumber: number) {
    this.cells = this.cells.map(([number, marked]) =>
      number === calledNumber ? [number, true] : [number, marked]
    );

    this.lastMarked = calledNumber;

    return this.check();
  }

  score() {
    if (!this.hasBingo || this.lastMarked === null) {
      throw new Error('Stop cheating!');
    }

    const sumUnmarked = this.cells
      .map(([number, marked]) => (marked ? 0 : number))
      .reduce((acc, current) => acc + current, 0);

    return sumUnmarked * this.lastMarked;
  }

  private check() {
    for (let i = 0; i < BingoBoard.SIZE; i++) {
      const row = this.cells.filter(
        (_cell, index) =>
          i * BingoBoard.SIZE <= index && index < (i + 1) * BingoBoard.SIZE
      );
      const column = this.cells.filter(
        (_cell, index) => (index - i) % BingoBoard.SIZE === 0
      );

      if ([this.checkSet(row), this.checkSet(column)].some((x) => x)) {
        this.hasBingo = true;
        break;
      }
    }

    return this.hasBingo;
  }

  private checkSet(set: BingoCell[]) {
    return set.every(([_, marked]) => marked);
  }
}

function parseLine(line: string, csv = false) {
  return line
    .trim()
    .split(csv ? ',' : /\W+/)
    .map(Number);
}

function parseCallouts(allLines: string[]) {
  return parseLine(allLines[0], true);
}

function parseBoards(allLines: string[]) {
  const boardsCount = (allLines.length - 1) / (BingoBoard.SIZE + 1);
  console.log(`${boardsCount} boards in play`);

  const boards = [...Array(boardsCount).keys()]
    .map((index) => 2 + index * 6)
    .map((boardStartIndex) =>
      allLines.slice(boardStartIndex, boardStartIndex + BingoBoard.SIZE)
    )
    .map((boardLinesArray) => boardLinesArray.join(' '))
    .map((boardLines) => parseLine(boardLines))
    .map((boardLines) => new BingoBoard(boardLines));

  return boards;
}

async function bingo(filename: string) {
  const allLines = await readAllLines(filename);

  const callouts = parseCallouts(allLines);

  const boards = parseBoards(allLines);
  let boardsInPlay = boards;
  const finishedBoards: BingoBoard[] = [];

  for (const number of callouts) {
    boardsInPlay.forEach((board) => {
      const gotBingo = board.mark(number);
      if (gotBingo) {
        finishedBoards.push(board);
      }
    });

    boardsInPlay = boardsInPlay.filter((board) => !board.hasBingo);

    if (boardsInPlay.length === 0) {
      break;
    }
  }

  console.log(`Bingo! Score ${finishedBoards[0].score()}`);
  console.log(
    `Last board with score ${finishedBoards[finishedBoards.length - 1].score()}`
  );
}

await bingo('input.txt');
