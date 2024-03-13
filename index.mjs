import ExcelJS from 'exceljs';
import {
  supplierColumnIndexs,
  yourColumnIndexs,
  supplierWorkBookConfigs,
  yourWorkbookConfigs,
  startRow,
} from './config.mjs';
import {
  getDataByRange,
  selectRange,
} from './cellUtils.mjs';
import {
  generateResponse,
} from './filterUtils.mjs';
import {
  createFile,
} from './exportExcelUtils.mjs';

const {
  filePath: supplierFilePath,
  worksheetName: supplierWorksheetName,
} = supplierWorkBookConfigs;

const {
  filePath: yourFilePath,
  worksheetName: yourWorksheetName,
} = yourWorkbookConfigs;

const {
  supplier: s_supplier,
  SBC_description: s_SBC_description,
} = supplierColumnIndexs;

const {
  SBC_partNumber: y_SBC_partNumber,
  supplier: y_supplier,
} = yourColumnIndexs;

// Read both workbook
const supplierWorkBook = new ExcelJS.Workbook();
const yourWorkbook = new ExcelJS.Workbook();

await supplierWorkBook.xlsx.readFile(supplierFilePath);
await yourWorkbook.xlsx.readFile(yourFilePath);

const supplierWorksheet = supplierWorkBook.getWorksheet(supplierWorksheetName);
const yourWorkSheet = yourWorkbook.getWorksheet(yourWorksheetName);

const { rowCount: sRowCount } = supplierWorksheet;
const { rowCount: yRowCount } = yourWorkSheet;

// define data range in supplier excel worksheet
const supplierDataPosition = selectRange([s_supplier, startRow], [s_SBC_description, sRowCount]);
const yourDataPosition = selectRange([y_SBC_partNumber, startRow], [y_supplier, yRowCount]);

// get data cell by cell by defined range in supplier worksheet
const allSupplierDatas = getDataByRange(supplierWorksheet, supplierDataPosition, { based: 'row', mix: false });
const yourSupplierDatas = getDataByRange(yourWorkSheet, yourDataPosition, { based: 'row', mix: false });

const final = generateResponse(allSupplierDatas, yourSupplierDatas, { based: 'row', mix: false });
// console.log(final, 'final');
createFile(final);
// const datas = writeDatas(final[1]);
// console.log(datas);
