import { describe, it, expect } from 'vitest';
import { isPostalCode } from 'src';

describe('isPostalCode', () => {
	it('应返回 true：合法的 6 位数字且首位非 0，如 100000', () => {
		expect(isPostalCode('100000')).toBe(true);
	});

	it('应返回 true：最大边界值 999999', () => {
		expect(isPostalCode('999999')).toBe(true);
	});

	it('应返回 false：首位为 0（如 012345）', () => {
		expect(isPostalCode('012345')).toBe(false);
	});

	it('应返回 false：长度不足 6 位（如 12345）', () => {
		expect(isPostalCode('12345')).toBe(false);
	});

	it('应返回 false：长度超过 6 位（如 1234567）', () => {
		expect(isPostalCode('1234567')).toBe(false);
	});

	it('应返回 false：包含字母（如 12A456）', () => {
		expect(isPostalCode('12A456')).toBe(false);
	});

	it('应返回 false：包含符号（如 1234-6）', () => {
		expect(isPostalCode('1234-6')).toBe(false);
	});

	it('应返回 false：字符串中包含空格（如 100000 空格结尾）', () => {
		expect(isPostalCode('100000 ')).toBe(false);
	});

	it('应返回 false：纯空字符串', () => {
		expect(isPostalCode('')).toBe(false);
	});

	it('应返回 false：传入数字类型（如 100000 数字而非字符串）', () => {
		// @ts-expect-error 测试非字符串输入的健壮性
		expect(isPostalCode(100000)).toBe(false);
	});

	it('应返回 false：传入 null', () => {
		// @ts-expect-error
		expect(isPostalCode(null)).toBe(false);
	});

	it('应返回 false：传入 undefined', () => {
		// @ts-expect-error
		expect(isPostalCode(undefined)).toBe(false);
	});

	it('应返回 false：传入对象类型', () => {
		// @ts-expect-error
		expect(isPostalCode({ value: '100000' })).toBe(false);
	});

	it('应返回 false：传入数组类型', () => {
		// @ts-expect-error
		expect(isPostalCode(['100000'])).toBe(false);
	});
});