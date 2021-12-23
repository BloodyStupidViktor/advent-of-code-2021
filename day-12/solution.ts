import { ListMap } from '../lib/better-maps.ts';
import { readLines } from '../lib/read-lines.ts';

class Graph {
  static Start = 'start';
  static End = 'end';

  private static SmallNodeRegex = /^[a-z]+$/;

  private graph: ListMap<string>;

  constructor() {
    this.graph = new ListMap();
  }

  addVertex(a: string, b: string) {
    this.graph.add(a, b);
    this.graph.add(b, a);
  }

  [Symbol.iterator] = function* (this: Graph) {
    return yield* this.traverse();
  };

  private *traverse() {
    let path = [Graph.Start];

    while (true) {
      let last = path[path.length - 1];

      if (last === Graph.End) {
        yield path.join(',');
      }

      let available = this.getAvailable(path);

      if (last === Graph.End || available.length === 0) {
        while (available.length === 0 && path.length > 1) {
          last = path[path.length - 1];
          path = path.slice(0, -1);
          available = this.getAvailable(path, last);
        }

        if (available.length === 0) {
          return;
        }
      }

      path = [...path, available[0]];
    }
  }

  private getAvailable(path: string[], continueFrom?: string) {
    const smallNodes = path
      .filter((node) => Graph.SmallNodeRegex.test(node))
      .sort();

    const visited = new Set(smallNodes);
    const hasDuplicates = visited.size !== smallNodes.length;

    const last = path[path.length - 1];

    const available = hasDuplicates
      ? this.graph.get(last).filter((node) => !visited.has(node))
      : this.graph
          .get(last)
          .filter(
            (node) =>
              (node !== Graph.Start || !visited.has(Graph.Start)) &&
              (node !== Graph.End || !visited.has(Graph.End))
          );
    return continueFrom
      ? available.slice(available.indexOf(continueFrom) + 1)
      : available;
  }
}

async function parseInput(filename: string) {
  const graph = new Graph();

  for await (const line of readLines(filename)) {
    const [a, b] = line.split('-');
    graph.addVertex(a, b);
  }

  console.log(`We've found ${[...graph].length} paths, sir!`);
}

// await parseInput('input-example.txt');
// await parseInput('input-example-2.txt');
// await parseInput('input-example-3.txt');
await parseInput('input.txt');
