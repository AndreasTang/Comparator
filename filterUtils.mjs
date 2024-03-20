import {
  supplierColumnIndexs,
  yourColumnIndexs,
  bannedSupplier,
  bannerOrSpecialPartNumber,
  startRow,
} from './config.mjs';
import {
  keyConverter,
  keyConverterReverse,
} from './cellUtils.mjs';

const {
  supplier: s_supplier,
  SBC_partNumber: s_SBC_partNumber,
  SBC_description: s_SBC_description,
} = supplierColumnIndexs;

const {
  SBC_partNumber: y_SBC_partNumber,
  SBC_description: y_SBC_description,
  supplier_partNumber: y_supplier_partNumber,
  supplier: y_supplier,
  TK_description,
  TK_partNumber,
} = yourColumnIndexs;

export const getSortedColumn = (cols) => {
  const colArr = Object.entries(cols).map(([key, colInx]) => [key, keyConverterReverse(colInx)]);
  const sorted = colArr.sort((a, b) => a[1] - b[1]);

  return sorted;
};

export const getSortedColumnMapping = (cols) => {
  const sorted = getSortedColumn(cols);
  const mapping = sorted.reduce((final, current, index) => {
    const [, col] = current;

    final[keyConverter(col)] = index;

    return final;
  }, {});

  return mapping;
};

export const getDatasByMapping = (currentData, mapping, target) => {
  const currentColIndex = mapping[target];
  const targetDataPositionPair = currentData[currentColIndex];

  return targetDataPositionPair;
};

export const getDataMapping = (datas, colMapping, targetIndex) => {
  const mapping = datas.reduce((final, current) => {
    const [pos, data] = getDatasByMapping(current, colMapping, targetIndex);

    if (data !== undefined && data !== null) {
      final[data.trim()] = pos;
    }

    return final;
  }, {});

  return mapping;
};

export const addConvertRowMapping = (currentData, targetData, mappingData) => {
  const currentRow = currentData[0][0][1];
  const targetRow = targetData[1];

  mappingData[currentRow] = targetRow;

  return mappingData;
};

export const removeTitle = (supplierDatas, yourDatas) => {
  const [, ...supplierData] = supplierDatas;
  const [, ...yourData] = yourDatas;

  return [supplierData, yourData];
};

export const processBannedSupplier = (datas, mapping) => {
  const [unDone, done] = datas;
  const [passed, banned] = unDone.reduce((final, current) => {
    const supplier = getDatasByMapping(current, mapping, s_supplier)[1] || '';
    const normalizedSupplier = supplier.replaceAll(' ', '_');

    if (bannedSupplier[normalizedSupplier]) {
      final[1].push([current, bannedSupplier[normalizedSupplier]]);
    } else {
      final[0].push(current);
    }

    return final;
  }, [[], []]);

  return [passed, done.concat(banned)];
};

export const processBannedPartNumber = (datas, mapping) => {
  const [unDone, done] = datas;

  const [passed, banned] = unDone.reduce((final, current) => {
    const [passed, banned] = final;
    const [, partNumber] = getDatasByMapping(current, mapping, s_SBC_partNumber) || [];

    if (partNumber === null) {
      banned.push([current, 'Empty field']);
    } else if (bannerOrSpecialPartNumber[partNumber]) {
      banned.push([current, bannerOrSpecialPartNumber[partNumber]]);
    } else {
      passed.push(current);
    }

    return final;
  }, [[], []]);

  return [passed, done.concat(banned)];
};

export const matchingPartNumber = (supplierDatas, yourDatas, colMapping) => {
  const [supplierColMapping, yourColMapping] = colMapping;
  const [unDone, done] = supplierDatas;

  const partNumberMapping = getDataMapping(yourDatas, yourColMapping, y_SBC_partNumber);
  const subPartNumberMapping = getDataMapping(yourDatas, yourColMapping, y_supplier_partNumber);

  const [match, unMatched, rowExchangeMapping] = unDone.reduce((final, current) => {
    const [match, unMatched, rowExchangeMapping] = final;
    const [, partNumber] = getDatasByMapping(current, supplierColMapping, s_SBC_partNumber);

    // eslint-disable-next-line no-restricted-globals
    if (!isNaN(partNumber)) {
      if (partNumberMapping[partNumber] !== undefined) {
        addConvertRowMapping(current, partNumberMapping[partNumber], rowExchangeMapping);
        match.push(current);
      } else {
        unMatched.push([current, 'no data']);
      }
    } else if (partNumber.includes(';')) {
      const splitedPartNumbers = partNumber.split(';').map((pn) => pn.trim());

      const [isAllMatch, matchingTarget] = splitedPartNumbers.reduce((final, current, index) => {
        const [, matchingTarget] = final;
        if (partNumberMapping[current]) {
          return index === 0 ? [true, partNumberMapping[current]] : [true, matchingTarget];
        }

        if (subPartNumberMapping[current]) {
          return index === 0 ? [true, subPartNumberMapping[current]] : [true, matchingTarget];
        }

        return [false, matchingTarget];
      }, [true]);

      if (isAllMatch) {
        addConvertRowMapping(current, matchingTarget, rowExchangeMapping);
        match.push(current);
      } else {
        unMatched.push([current, 'no data']);
      }
    } else if (subPartNumberMapping[partNumber] !== undefined) {
      addConvertRowMapping(current, subPartNumberMapping[partNumber], rowExchangeMapping);
      match.push(current);
    } else {
      unMatched.push([current, 'no data']);
    }
    return final;
  }, [[], [], {}]);

  return [match, done.concat(unMatched), rowExchangeMapping];
};

export const matchingDescirption = (supplierDatas, yourDatas, colMapping, config) => {
  const [supplierColMapping, yourColMapping] = colMapping;
  const [unDone, done, rowExchangeMapping] = supplierDatas;
  const { based } = config;

  const [match, unMatched] = unDone.reduce((final, current) => {
    const [match, unMatched] = final;
    const currentRow = current[0][0][1];
    const targetRow = rowExchangeMapping[currentRow] - startRow;
    const targetColumn = yourColMapping[y_SBC_description];
    const targetDataPair = (based === 'row' ? yourDatas[targetRow][targetColumn] : yourDatas[targetColumn][targetRow]) || [];
    const targetData = targetDataPair[1] || '';

    const [, description] = getDatasByMapping(current, supplierColMapping, s_SBC_description) || '';

    if (targetData.trim() === description.trim()) {
      match.push(current);
    } else {
      unMatched.push([current, 'description ERROR']);
    }

    return final;
  }, [[], []]);

  return [match, done.concat(unMatched), rowExchangeMapping];
};

export const matchingSupplier = (supplierDatas, yourDatas, colMapping, config) => {
  const [supplierColMapping, yourColMapping] = colMapping;
  const [unDone, done, rowExchangeMapping] = supplierDatas;
  const { based } = config;

  const [match, unMatched] = unDone.reduce((final, current) => {
    const [match, unMatched] = final;
    const currentRow = current[0][0][1];
    const targetRow = rowExchangeMapping[currentRow] - startRow;
    const targetColumn = yourColMapping[y_supplier];
    const targetDataPair = (based === 'row' ? yourDatas[targetRow][targetColumn] : yourDatas[targetColumn][targetRow]) || [];
    const targetData = targetDataPair[1] || '';

    const [, supplier] = getDatasByMapping(current, supplierColMapping, s_supplier) || '';

    if (targetData.trim().toLowerCase().includes(supplier.trim().toLowerCase())) {
      match.push(current);
    } else {
      unMatched.push([current, 'Supplier ERROR']);
    }

    return final;
  }, [[], []]);

  return [match, done.concat(unMatched), rowExchangeMapping];
};

export const addMatchingSucessText = (datas) => {
  const [unDone, done] = datas;
  const sucessedDatas = unDone.map((data) => [data, 'Sucess']);

  return [sucessedDatas, done];
};

export const addSucessedTK = (datas, yourDatas, colMapping, config) => {
  const [, yourColMapping] = colMapping;
  const [unDone, done, rowExchangeMapping] = datas;
  const { based } = config;

  const sucessWithTK = unDone.map((current) => {
    const currentRow = current[0][0][1];
    const targetRow = rowExchangeMapping[currentRow] - startRow;
    const TKDescriptionColumn = yourColMapping[TK_description];
    const TKPartNumberColumn = yourColMapping[TK_partNumber];
    const TKD_dataPair = (based === 'row' ? yourDatas[targetRow][TKDescriptionColumn] : yourDatas[TKDescriptionColumn][targetRow]) || [];
    const TKPN_dataPair = (based === 'row' ? yourDatas[targetRow][TKPartNumberColumn] : yourDatas[TKPartNumberColumn][TKPartNumberColumn]) || [];
    // const aaa = current.concat([TKD_dataPair, TKPN_dataPair])

    return current.concat([TKPN_dataPair, TKD_dataPair]);
  });

  return [sucessWithTK, done, rowExchangeMapping];
};

export const mergeDuplicated = (datas, colMapping) => {
  const [unDone, done, rowExchangeMapping] = datas;
  const [supplierColMapping] = colMapping;

  const [unDoneUnique] = unDone.reduce((final, current) => {
    const [unique, existed] = final;
    const [, partNumber] = getDatasByMapping(current, supplierColMapping, s_SBC_partNumber);

    if (existed[partNumber.trim()]) {
      unique.push(current);
    }

    existed[partNumber] = partNumber;

    return final;
  }, [[], {}]);

  const [doneUnique] = done.reduce((final, current) => {
    const [unique, existed] = final;

    const [, partNumber] = getDatasByMapping(current[0], supplierColMapping, s_SBC_partNumber);
    const [, description] = getDatasByMapping(current[0], supplierColMapping, s_SBC_description);
    const [, supplier] = getDatasByMapping(current[0], supplierColMapping, s_supplier);
    
    const trimedPartNumber = partNumber ? partNumber.trim() : '';
    const trimedDescription = description ? description.trim() : '';
    const trimedSupplier = supplier ? supplier.trim() : '';
    const allText = `${trimedPartNumber}+${trimedDescription}+${trimedSupplier}`

    if (existed[allText]) {
      unique.push(current);
    }

    existed[allText] = allText;

    return final;
  }, [[], {}]);

  return [unDoneUnique, doneUnique, rowExchangeMapping];
};

export const generateResponse = (supplierDatas, yourDatas, config) => {
  const supplierColMapping = getSortedColumnMapping(supplierColumnIndexs);
  const yourColMapping = getSortedColumnMapping(yourColumnIndexs);
  const colMapping = [supplierColMapping, yourColMapping];

  const filteredBySupplier = processBannedSupplier([supplierDatas, []], supplierColMapping);
  const filteredByPartNumber = processBannedPartNumber(filteredBySupplier, supplierColMapping);
  const filteredByMatchingPartNumber = matchingPartNumber(filteredByPartNumber, yourDatas, colMapping);
  const filteredByMatchingDescirption = matchingDescirption(filteredByMatchingPartNumber, yourDatas, colMapping, config);
  const filteredByMatchingSupplier = matchingSupplier(filteredByMatchingDescirption, yourDatas, colMapping, config);
  const merged = mergeDuplicated(filteredByMatchingSupplier, colMapping);
  const final = addSucessedTK(merged, yourDatas, colMapping, config);
  const result = addMatchingSucessText(final);

  return result;
};
