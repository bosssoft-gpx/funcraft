/**
 * 对数字进行千分位格式化，支持数字和字符串类型的入参。
 * 如果输入的是字符串类型，会尝试将其转换为数字，若无法转换，则抛出异常。
 *
 * @param value 要格式化的数字或数字字符串。
 * @returns 返回格式化后的字符串，带有千分位分隔符。
 * @throws 如果输入的字符串无法转换为有效数字，则抛出异常。
 *
 * @example
 * const formatted = formatNumber(1234567.89); // 返回 "1,234,567.89"
 * const formatted2 = formatNumber("1000"); // 返回 "1,000.00"
 * const formatted3 = formatNumber("invalid"); // 抛出异常
 */
export const formatNumber = (value: number | string): string => {
    // 如果是字符串类型，尝试转换为数字
    if (typeof value === 'string') {
        const parsedValue = parseFloat(value);
        if (isNaN(parsedValue)) {
            throw new Error(`无法将字符串 "${value}" 转换为有效数字`);
        }
        value = parsedValue;
    }

    // 如果是数字类型，进行格式化处理
    if (isNaN(value)) return '0';

    const [integer, decimal] = value.toFixed(2).split('.');
    const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return `${formattedInteger}.${decimal}`;
};
