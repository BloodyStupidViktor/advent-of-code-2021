import { readAllLines } from '../lib/read-lines.ts';

const HEX_MAP: { [key: string]: string } = {
  0: '0000',
  1: '0001',
  2: '0010',
  3: '0011',
  4: '0100',
  5: '0101',
  6: '0110',
  7: '0111',
  8: '1000',
  9: '1001',
  A: '1010',
  B: '1011',
  C: '1100',
  D: '1101',
  E: '1110',
  F: '1111',
};

function hexToBinary(hex: string) {
  return [...hex].map((char) => HEX_MAP[char]).join('');
}

function binaryToNumber(binary: string, start = 0, length = binary.length) {
  return parseInt(binary.substr(start, length), 2);
}

type Content = {
  bits: string;
  size: number;
  value: number | Packet[];
};

type Packet = {
  bits: string;
  version: number;
  totalVersion: number;
  typeId: number;
  content: Content;
  value: number;
  size: number;
};

function parseNumber(bits: string): Content {
  let numberBits = '';
  let i = 0;
  numberBits += bits.substr(i + 1, 4);
  while (bits[i] !== '0') {
    i += 5;
    numberBits += bits.substr(i + 1, 4);
  }

  return {
    bits: bits.substr(0, i + 5),
    value: binaryToNumber(numberBits),
    size: i + 5,
  };
}

function parseSubpackets(
  bits: string,
  limit: number,
  limitBySize: boolean
): Content {
  let totalCount = 0;
  let totalSize = 0;
  const packets: Packet[] = [];

  const isDone = () => (limitBySize ? totalSize >= limit : totalCount >= limit);

  while (!isDone()) {
    const packet = parsePacket(bits.slice(totalSize));
    packets.push(packet);
    totalSize += packet.size;
    totalCount++;
  }

  return {
    bits: bits.substr(0, totalSize),
    size: totalSize,
    value: packets,
  };
}

function parseOperation(bits: string): Content {
  const useSize = bits[0] === '0';
  const offset = useSize ? 15 : 11;
  const value = binaryToNumber(bits.substr(1, offset));

  const subpackets = parseSubpackets(bits.slice(1 + offset), value, useSize);

  return {
    ...subpackets,
    size: subpackets.size + 1 + offset,
  };
}

enum PacketType {
  Sum = 0,
  Product = 1,
  Minumum = 2,
  Maximum = 3,
  Literal = 4,
  GreaterThan = 5,
  LessThan = 6,
  Equal = 7,
}

function parseContent(typeId: PacketType, bits: string): [Content, number] {
  let content: Content;

  if (typeId === PacketType.Literal) {
    content = parseNumber(bits);
    return [content, content.value as number];
  }

  content = parseOperation(bits);
  const contentValue = content.value as Packet[];
  let value: number;

  switch (typeId) {
    case PacketType.Sum:
      value = contentValue.reduce((acc, c) => acc + c.value, 0);
      break;
    case PacketType.Product:
      value = contentValue.reduce((acc, c) => acc * c.value, 1);
      break;
    case PacketType.Minumum:
      value = contentValue.reduce(
        (acc, c) => (c.value < acc ? c.value : acc),
        Infinity
      );
      break;
    case PacketType.Maximum:
      value = contentValue.reduce(
        (acc, c) => (c.value > acc ? c.value : acc),
        -Infinity
      );
      break;
    case PacketType.GreaterThan:
      value = contentValue[0].value > contentValue[1].value ? 1 : 0;
      break;
    case PacketType.LessThan:
      value = contentValue[0].value < contentValue[1].value ? 1 : 0;
      break;
    case PacketType.Equal:
      value = contentValue[0].value === contentValue[1].value ? 1 : 0;
      break;
  }

  return [content, value];
}

function parsePacket(bits: string): Packet {
  const version = binaryToNumber(bits, 0, 3);
  let totalVersion = version;
  const typeId: PacketType = binaryToNumber(bits, 3, 3);
  const rest = bits.slice(6);

  const [content, value] = parseContent(typeId, rest);

  if (typeId !== PacketType.Literal) {
    totalVersion += (content.value as Packet[]).reduce(
      (acc, c) => acc + c.totalVersion,
      0
    );
  }

  return {
    bits: bits.substr(0, 6 + content.size),
    version,
    totalVersion,
    typeId,
    content,
    value: value,
    size: 6 + content.size,
  };
}

function printPacket(packet: Packet, indent = 0) {
  const prefix = (i: number) => Array.from({ length: i }, () => ' ').join('');
  const log = (data: string, extraIndent = 0) =>
    console.log(`${prefix(indent + extraIndent)}${data}`);

  log(`{`);
  // log(`bits: ${packet.bits}`, 2);
  // log(`version: ${packet.version}`, 2);
  // log(`typeId: ${packet.typeId}`, 2);
  log(`type: ${PacketType[packet.typeId]}`);
  // log(`size: ${packet.size}`, 2);
  log(`value: ${packet.value}`, 2);
  if (typeof packet.content.value === 'number') {
    // log(`content: {`, 2);
    // log(`bits: ${packet.content.bits}`, 4);
    // log(`size: ${packet.content.size}`, 4);
    // log(`value: ${packet.content.value}`, 4);
    // log(`}`, 2);
  } else {
    log(`content: [`, 2);
    packet.content.value.forEach((p) => printPacket(p, indent + 4));
    log(`]`, 2);
  }
  log(`}`);
}

async function parseInput(filename: string) {
  const lines = await readAllLines(filename);
  return lines.map(hexToBinary).map(parsePacket);
}

async function decodePackets(filename: string) {
  const packets = await parseInput(filename);
  console.log(packets);
  // packets.forEach(printPacket);
}

// await decodePackets('input-example.txt');
// await decodePackets('input-example-2.txt');
await decodePackets('input.txt');
