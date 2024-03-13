import chalk from 'chalk';

export const numberToWordObj = {
  1: 'A',
  2: 'B',
  3: 'C',
  4: 'D',
  5: 'E',
  6: 'F',
  7: 'G',
  8: 'H',
  9: 'I',
  10: 'J',
  11: 'K',
  12: 'L',
  13: 'M',
  14: 'N',
  15: 'O',
  16: 'P',
  17: 'Q',
  18: 'R',
  19: 'S',
  20: 'T',
  21: 'U',
  22: 'V',
  23: 'W',
  24: 'X',
  25: 'Y',
  26: 'Z',
};

export const wordToNumberObj = Object.fromEntries(Object.entries(numberToWordObj).map(([number, word]) => [word, number]));

export const divdeToEnd = (number, divider = 26, word = '') => {
  if (number <= divider) {
    return numberToWordObj[number] + word;
  }

  const remainder = number % divider;
  const nextNumber = (number - remainder) / divider;
  const nextWord = remainder === 0 ? numberToWordObj[1] : numberToWordObj[remainder];
  const newWord = nextWord + word;

  return divdeToEnd(nextNumber, divider, newWord);
};

export const keyConverter = (number) => {
  if (number <= 0) {
    return '';
  }

  const words = divdeToEnd(number);

  return words;
};

export const keyConverterReverse = (word = '') => {
  if (!word) {
    return 0;
  }

  const wordLength = word.length;

  if (wordLength <= 1) {
    return wordToNumberObj[word];
  }

  const maxPower = wordLength - 1;
  const finalNumber = [...word].reduce((final, current, index) => {
    const number = wordToNumberObj[current] * (26 ** (maxPower - index));

    return final + number;
  }, 0);

  return finalNumber;
};

export const reverseWordToNumber = (word) => {
  // eslint-disable-next-line no-restricted-globals
  const reversed = isNaN(word) ? Number(keyConverterReverse(word)) : word;
  return reversed;
};

export const normalizePositionToNumber = (from, to) => {
  const { column: fromColumn, row: fromRow } = from;
  const { column: toColumn, row: toRow } = to;
  const [fc, fr, tc, tr] = [fromColumn, fromRow, toColumn, toRow].map((target) => reverseWordToNumber(target));

  return [{ column: fc, row: fr }, { column: tc, row: tr }];
};

// columnIndex: start position of the column, ex: 1 for column A
// rowStart: start position of row
// rowEnd: end position of row
// ex: getCellKeysInColumn(2, 3, 6) => ['B3', 'B4', 'B5', 'B6']
export const getCellKeysInColumn = (columnIndex, rowStart, rowEnd, isSplite) => {
  const range = (rowEnd - rowStart) || 1;

  const keys = [];

  for (let i = 0; i <= range; i += 1) {
    const key = isSplite ? [`${keyConverter(columnIndex)}`, `${rowStart + i}`] : `${keyConverter(columnIndex)}${rowStart + i}`;
    keys.push(key);
  }

  return keys;
};

export const getCellKeysInRow = (rowIndex, columnStart, columnEnd, isSplite) => {
  const range = (columnEnd - columnStart) || 1;

  const keys = [];

  for (let i = 0; i <= range; i += 1) {
    const key = isSplite ? [`${keyConverter(columnStart + i)}`, `${rowIndex}`] : `${keyConverter(columnStart + i)}${rowIndex}`;
    keys.push(key);
  }

  return keys;
};

export const getCells = (based, i, convertedFrom, convertedTo, isSplite) => {
  const { column: fromColumn, row: fromRow } = convertedFrom;
  const { column: toColumn, row: toRow } = convertedTo;

  switch (based) {
    case 'col':
      return getCellKeysInColumn(fromColumn + i, fromRow, toRow, isSplite);
    case 'row':
      return getCellKeysInRow(fromRow + i, fromColumn, toColumn, isSplite);
    default:
      return console.log(
        chalk.red('Error, no based provided, make sure you provide either "col" or "row" as based in getDataByRange function config'),
      );
  }
};

// get all cell keys from a select range
// from: start position { column, row }
// to: end position { column, row }
// ex: getCellKeysInRange({ 2, 2 }, { 5, 3 }) => [
//   'B2', 'B3',
//   'C2', 'C3',
//   'D2', 'D3',
//   'E2', 'E3',
// ]
export const getCellKeysInRange = (from, to, config) => {
  const { isSplite = true, based = 'col', mix = true } = config;

  if (based !== 'col' && based !== 'row') {
    return console.log(chalk.red('Error, no based provided, make sure you provide either "col" or "row" as based in getDataByRange function config'));
  }

  const [convertedFrom, convertedTo] = normalizePositionToNumber(from, to);

  const { column: fromColumn, row: fromRow } = convertedFrom;
  const { column: toColumn, row: toRow } = convertedTo;

  const columnDiff = Math.abs(toColumn - fromColumn);
  const rowDiff = Math.abs(toRow - fromRow);

  const maxIteration = {
    col: columnDiff,
    row: rowDiff,
  }[based];

  let allCells = [];

  for (let i = 0; i <= maxIteration; i += 1) {
    const cells = getCells(based, i, convertedFrom, convertedTo, isSplite);
    if (mix) {
      allCells = [...allCells, ...cells];
    } else {
      allCells = allCells.length ? [...allCells, cells] : [cells];
    }
  }

  return allCells;
};

export const getCellValuesPairs = (worksheet, cells = []) => {
  const allValues = cells.reduce((final, current) => {
    const isSplite = current.length > 1;
    const cellPosition = isSplite ? current.join('') : current;
    const cellValue = worksheet.getCell(cellPosition).value;
    final.push([current, cellValue]);

    return final;
  }, []);

  return allValues;
};

// range can be { from, to } or calculated cells: [['A, 1], ['A', 2]]
export const getDataByRange = (targetSheet, range, config) => {
  const { from, to } = range;
  const { mix } = config;
  const allCellsPosition = range.length ? range : getCellKeysInRange(from, to, config);

  return mix ? (
    getCellValuesPairs(targetSheet, allCellsPosition)
  ) : (
    allCellsPosition.map((cellPosition) => getCellValuesPairs(targetSheet, cellPosition))
  );
};

export const sortRange = (from, to) => {
  const [fc = 1, fr = 1] = from;
  const [tc = 1, tr = 1] = to;
  const [nfc, nfr, ntc, ntr] = [fc, fr, tc, tr].map((pos) => reverseWordToNumber(pos));
  const [sfc, stc] = nfc > ntc ? [ntc, nfc] : [nfc, ntc];
  const [sfr, str] = nfr > ntr ? [ntr, nfr] : [nfr, ntr];

  return [[sfc, sfr], [stc, str]];
};

export const selectRange = (from, to) => {
  const [sortedFrom, sortedTo] = sortRange(from, to);
  const [fc = 1, fr = 1] = sortedFrom;
  const [tc = 1, tr = 1] = sortedTo;

  return {
    from: { column: fc, row: fr },
    to: { column: tc, row: tr },
  };
};
