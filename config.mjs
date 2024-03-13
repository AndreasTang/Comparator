export const supplierWorkBookConfigs = {
  filePath: '活頁簿1.xlsx',
  worksheetName: '工作表1',
};

export const yourWorkbookConfigs = {
  filePath: '車架全料號.xlsx',
  worksheetName: '工作表1',
};

// For excel sended by your supplier
export const supplierColumnIndexs = {
  supplier: 'H',
  SBC_partNumber: 'I',
  SBC_description: 'J',
};

export const supplierColumnIndexsReverse = Object.fromEntries(Object.entries(supplierColumnIndexs).map(([key, value]) => [value, key]));

// For excel made by yourself
export const yourColumnIndexs = {
  SBC_partNumber: 'A',
  supplier_partNumber: 'B',
  SBC_description: 'C',
  TK_description: 'D',
  TK_partNumber: 'E',
  supplier: 'F',
  color: 'G'
}

// The supplier output straight away
export const bannedSupplier = {
  TOPKEY_CHINA: 'KT製作',
  OHLINS_TAIWAN: 'OHLINS避震器',
};

export const bannerOrSpecialPartNumber = {
  NONE: 'NONE',
  MYLAR: 'MYLAR'
};

export const exportingConfig = {
  workbookName: 'Result',
  creator: 'Chris Tang',
  lastModifiedBy: 'Chris Tang',
  worksheetName: 'exported',
  startRow: 1,
  titles: ['Result', 'At Row', 'Supplier', 'PartNumber', 'Descirption', 'TK_partNumber', 'TK_description'],
  titleWidths: [18, 10, 18, 50, 100, 50, 100],
  sucessColor: '#ff3feb2f',
  failedColor: '#ffeb4034',
  columnAlignment: { vertical: 'middle', horizontal: 'center' },
  titleCellFont: { size: 16, bold: true },
};

export const startRow = 2;