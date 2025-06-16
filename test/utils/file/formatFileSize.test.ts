import { describe, it, expect } from 'vitest';
import { formatFileSize } from 'src';

describe('formatFileSize 函数', () => {
	it('应当返回 "0 Byte" 当字节数为 0 时', () => {
		expect(formatFileSize(0)).toBe('0 Byte');
	});

	it('应当在默认行为下正确格式化为带 1 位小数的单位字符串', () => {
		expect(formatFileSize(1024)).toBe('1.0 KB');
		expect(formatFileSize(1048576)).toBe('1.0 MB');
		expect(formatFileSize(1073741824)).toBe('1.0 GB');
		expect(formatFileSize(1099511627776)).toBe('1.0 TB');
	});

	it('在设置 omitDecimal 为 true 时应省略小数，只保留整数', () => {
		expect(formatFileSize(1024, { omitDecimal: true })).toBe('1 KB');
		expect(formatFileSize(1048576, { omitDecimal: true })).toBe('1 MB');
		expect(formatFileSize(1073741824, { omitDecimal: true })).toBe('1 GB');
	});

	it('当单位为 Bytes 时，即使 omitDecimal 为 true 也应直接返回整数', () => {
		expect(formatFileSize(999, { omitDecimal: true })).toBe('999 Bytes');
	});

	it('默认行为下，小数应正常保留（即 omitDecimal 默认为 false）', () => {
		expect(formatFileSize(1536)).toBe('1.5 KB');
	});

	it('在 omitDecimal 为 true 时应正确进行四舍五入', () => {
		expect(formatFileSize(1536, { omitDecimal: true })).toBe('2 KB'); // 1.5 向上取整
	});

	it('当传入负数时应抛出异常', () => {
		expect(() => formatFileSize(-1)).toThrow('文件大小必须是非负数');
	});

	it('当传入非数字类型时应抛出异常', () => {
		// @ts-expect-error: 测试非法类型
		expect(() => formatFileSize('1000')).toThrow('文件大小必须是非负数');
	});

	it('当传入 NaN 时应抛出异常', () => {
		expect(() => formatFileSize(NaN)).toThrow('文件大小必须是非负数');
	});
});
