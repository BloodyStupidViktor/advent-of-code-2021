import { readAllLines } from '../lib/read-lines.ts';

class Point {
  constructor(public x: number, public y: number) {}

  onLineWith(other: Point) {
    return other.x === this.x || other.y === this.y;
  }

  sameAs(other: Point) {
    return other.x === this.x && other.y === this.y;
  }

  toString() {
    return `${this.x},${this.y}`;
  }
}

class Line {
  constructor(public a: Point, public b: Point) {}

  [Symbol.iterator] = function*(this: Line) {
    const direction = new Point(Math.sign(this.b.x - this.a.x), Math.sign(this.b.y - this.a.y));

    const current = this.a;
    yield current;
    while (!current.sameAs(this.b)) {
      current.x += direction.x;
      current.y += direction.y;
      yield current;
    }
  }
}

class DangerZoneRegister {
  private map: Map<string, number>;

  constructor() {
    this.map = new Map();
  }

  markVent(a: Point, b: Point, markDiagonals = false) {
    if (!markDiagonals && !a.onLineWith(b)) {
      return;
    }

    for (const point of new Line(a, b)) {
      this.markDangerous(point);
    }
  }

  getDangerZonesCount() {
    return [...this.map.values()].filter((beams) => beams > 1).length;
  }

  private markDangerous(point: Point) {
    const key = point.toString();
    const prevCount = this.map.get(key) || 0;
    this.map.set(key, prevCount + 1);
  }
}

function parseLine(line: string) {
  return line
    .split(' -> ')
    .map((end) => end.split(','))
    .map((ends) => ends.map(Number))
    .map(([x, y]) => new Point(x, y));
}

async function findDangerZones(filename: string, markDiagonals = false) {
  const allLines = await readAllLines(filename);

  const dangerLines = allLines.map((line) => parseLine(line));

  const register = new DangerZoneRegister();
  dangerLines.forEach(([a, b]) => register.markVent(a, b, markDiagonals));

  console.log(
    `Region mapping complete, sir! Found ${register.getDangerZonesCount()} danger zones.`
  );
}

// await findDangerZones('input-example.txt', true);
await findDangerZones('input.txt', true);
