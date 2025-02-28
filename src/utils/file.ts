/**
 * 格式化文件大小，转换字节数为更易读的单位（Bytes、KB、MB、GB、TB）。
 *
 * @param bytes 文件的字节大小，必须为非负数。
 * @returns 返回格式化后的文件大小字符串，带单位（如 "10.5 MB"）。
 * @throws 如果 `bytes` 不是数字或小于 0，则抛出异常。
 *
 * @example
 * formatFileSize(1024); // "1.0 KB"
 * formatFileSize(1048576); // "1.0 MB"
 * formatFileSize(1073741824); // "1.0 GB"
 * formatFileSize(0); // "0 Byte"
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes < 0) {
        throw new Error('文件大小必须是非负数');
    }

    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';

    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    if (i === 0) return `${bytes} ${sizes[i]}`;

    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};
