import ExcelJS from 'exceljs';
import { exportingConfig } from './config.mjs';

export const setStyle = (worksheet, config) => {
  const { titleWidths, columnAlignment } = config;

  titleWidths.forEach((width, index) => {
    const column = worksheet.getColumn(index + 1);
    column.width = width;
    column.alignment = columnAlignment;
  });
};

export const writeTitle = (worksheet, config) => {
  const { titles, startRow, titleCellFont } = config;

  titles.forEach((title, index) => {
    const cell = worksheet.getRow(startRow).getCell(index + 1);
    cell.value = title;
    cell.font = titleCellFont;
  });
};

export const writeDatas = (datas, worksheet, startRow, color) => {
  datas.forEach((data, rowIndex) => {
    const [posAndDataPairs, result] = data;
    const targetRowIndex = posAndDataPairs[0][0][1];
    const rowDatas = posAndDataPairs.reduce((final, current) => final.concat(current[1]), []);
    const newRowDatas = [result, targetRowIndex, ...rowDatas];

    newRowDatas.forEach((newData, colIndex) => {
      const cell = worksheet.getRow(rowIndex + +startRow).getCell(colIndex + 1);
      cell.value = newData;
      cell.font = { color: { argb: color } };
    });
  });
};

export const createFile = async (datas) => {
  const [sucess, failed] = datas;
  const {
    workbookName,
    creator,
    lastModifiedBy,
    worksheetName,
    startRow,
    sucessColor,
    failedColor,
  } = exportingConfig;
  const workbook = new ExcelJS.Workbook();

  workbook.creator = creator;
  workbook.lastModifiedBy = lastModifiedBy;

  const worksheet = workbook.addWorksheet(worksheetName);

  setStyle(worksheet, exportingConfig);
  writeTitle(worksheet, exportingConfig);

  if (sucess.length) {
    writeDatas(sucess, worksheet, startRow + 1, sucessColor);
  }

  if (failed.length) {
    writeDatas(failed, worksheet, startRow + sucess.length + 3, failedColor);
  }

  await workbook.xlsx.writeFile(`${workbookName}.xlsx`);

  console.log('done !!');
};
