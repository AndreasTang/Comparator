import { keyConverter, keyConverterReverse } from './cellUtils.mjs'

const a = keyConverter(1 * 26 ** 2 + 2 * 26 + 3);
console.log(a);
console.log(keyConverterReverse(a));
