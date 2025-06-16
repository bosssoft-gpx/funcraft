/**
 * 格式化文件大小，转换字节数为更易读的单位（Bytes、KB、MB、GB、TB）。
 *
 * @param bytes 文件的字节大小，必须为非负数。
 * @param options 可选配置项。
 * @param options.omitDecimal 是否省略小数位，仅保留整数（默认为 false）。
 * @returns 返回格式化后的文件大小字符串，带单位（如 "10.5 MB"）。
 * @throws 如果 `bytes` 不是数字或小于 0，则抛出异常。
 *
 * @example
 * formatFileSize(1024); // "1.0 KB"
 * formatFileSize(1048576); // "1.0 MB"
 * formatFileSize(1048576, { omitDecimal: true }); // "1 MB"
 * formatFileSize(0); // "0 Byte"
 */
export const formatFileSize = (
  bytes: number,
  options?: {
      /**
       * 是否省略小数位，仅保留整数
       *
       * @default false
       */
      omitDecimal?: boolean;
  }
): string => {
    if (typeof bytes !== 'number' || isNaN(bytes) || bytes < 0) {
        throw new Error('文件大小必须是非负数');
    }

    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';

    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = bytes / Math.pow(1024, i);
    const shouldOmitDecimal = options?.omitDecimal ?? false;

    const formattedValue =
      i === 0 || shouldOmitDecimal ? Math.round(value).toString() : value.toFixed(1);

    return `${formattedValue} ${sizes[i]}`;
};
