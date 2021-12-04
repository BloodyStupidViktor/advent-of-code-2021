function printBingoBoardIndexes() {
  for (let i = 0; i < 5; i++) {
    const line = [];
    for (let j = i * 5; j < (i + 1) * 5; j++) {
      line.push(`${j}`.padStart(2, ' '));
    }

    console.log(line.join(' '));
  }
}
