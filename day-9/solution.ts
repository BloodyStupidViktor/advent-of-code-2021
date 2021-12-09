import { readAllLines } from '../lib/read-lines.ts';

class Basin {
  public basin: Set<Location>;

  constructor(private heightmap: Heightmap, private lowPoint: Location) {
    this.basin = this.chart();
  }

  get size() {
    return this.basin.size;
  }

  private chart() {
    let unvisted = [this.lowPoint];
    const visited = new Set<Location>();

    while (unvisted.length > 0) {
      const [next, ...rest] = unvisted;
      unvisted = rest;

      visited.add(next);

      const adjacentUnvisited = next
        .getAdjacent()
        .filter(
          (location) => !location.isHighPoint() && !visited.has(location)
        );
      unvisted = [...unvisted, ...adjacentUnvisited];
    }

    return visited;
  }
}

class Location {
  constructor(
    private heightmap: Heightmap,
    public height: number,
    public row: number,
    public column: number
  ) {}

  isLowPoint() {
    return this.getAdjacentValues().every(
      (adjacentValue) => adjacentValue > this.height
    );
  }

  isHighPoint() {
    return this.height === 9;
  }

  getAdjacent() {
    return this.heightmap.getAdjacent(this.row, this.column);
  }

  getAdjacentValues() {
    return this.getAdjacent().map((l) => l.height);
  }
}

class Heightmap {
  rowsCount: number;
  columnsCount: number;

  private cache: Map<string, Location>;

  constructor(private heights: number[][]) {
    this.rowsCount = this.heights.length;
    this.columnsCount = this.heights[0].length;

    this.cache = new Map<string, Location>();
  }

  [Symbol.iterator] = function* (this: Heightmap) {
    for (let row = 0; row < this.rowsCount; row++) {
      for (let column = 0; column < this.columnsCount; column++) {
        // yield new Location(this, this.heights[row][column], row, column);
        yield this.getLocation(row, column)!;
      }
    }
  };

  getValue(row: number, column: number) {
    return this.heights[row][column];
  }

  getAdjacent(row: number, column: number) {
    const coordinates = [
      [row, column - 1],
      [row - 1, column],
      [row + 1, column],
      [row, column + 1],
    ];

    const locations = coordinates
      .map(([r, c]) => this.getLocation(r, c))
      .filter((x): x is Location => x != null);

    return locations;
  }

  private getLocation(row: number, column: number) {
    const cacheKey = `${row},${column}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const inBounds =
      0 <= row &&
      row < this.rowsCount &&
      0 <= column &&
      column < this.columnsCount;
    if (!inBounds) {
      return null;
    }

    const location = new Location(this, this.heights[row][column], row, column);
    this.cache.set(cacheKey, location);
    return location;
  }
}

async function assesLavaTubes(filename: string) {
  const allLines = await readAllLines(filename);

  const heightmap = new Heightmap(
    allLines.map((row) => row.split('').map(Number))
  );

  const lowPoints: Location[] = [];

  for (const location of heightmap) {
    if (location.isLowPoint()) {
      lowPoints.push(location);
    }
  }

  const count = lowPoints.length;
  const danger = lowPoints.reduce((acc, p) => acc + p.height + 1, 0);
  console.log(
    `We are detecting ${count} low points with a combined danger level of ${danger}, sir!`
  );

  const result = lowPoints
    .map((lowPoint) => new Basin(heightmap, lowPoint))
    .map((basin) => basin.size)
    .sort((a, b) => b - a)
    .slice(0, 3)
    .reduce((acc, c) => acc * c, 1);

  console.log(`Combined danger of largest basins is ${result}, sir!`);
}

// await assesLavaTubes('input-example.txt');
await assesLavaTubes('input.txt');
