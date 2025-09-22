import { describe, it, expect } from 'vitest';
import { safeErrorWrapper } from 'src';

describe('safeErrorWrapper', () => {
	it('传入 Error 实例时，返回原 Error', () => {
		const err = new Error('test error');
		const result = safeErrorWrapper(err);
		expect(result).toBe(err);
		expect(result.message).toBe('test error');
	});

	it('传入字符串时，返回 message 为该字符串的 Error', () => {
		const result = safeErrorWrapper('string error');
		expect(result).toBeInstanceOf(Error);
		expect(result.message).toBe('string error');
	});

	it('传入包含 message 字段的对象时，返回 message 为该字段的 Error', () => {
		const result = safeErrorWrapper({ message: 'object error' });
		expect(result).toBeInstanceOf(Error);
		expect(result.message).toBe('object error');
	});

	it('传入不包含 message 字段的对象时，返回默认错误信息', () => {
		const result = safeErrorWrapper({ code: 404 });
		expect(result).toBeInstanceOf(Error);
		expect(result.message).toBe('Unknown error');
	});

	it('传入数字时，返回默认错误信息', () => {
		const result = safeErrorWrapper(123);
		expect(result).toBeInstanceOf(Error);
		expect(result.message).toBe('Unknown error');
	});

	it('传入 null 时，返回默认错误信息', () => {
		const result = safeErrorWrapper(null);
		expect(result).toBeInstanceOf(Error);
		expect(result.message).toBe('Unknown error');
	});

	it('传入 undefined 时，返回默认错误信息', () => {
		const result = safeErrorWrapper(undefined);
		expect(result).toBeInstanceOf(Error);
		expect(result.message).toBe('Unknown error');
	});

	it('传入无法识别的类型并指定 fallback，返回 fallback 信息', () => {
		const result = safeErrorWrapper(42, '自定义错误信息');
		expect(result).toBeInstanceOf(Error);
		expect(result.message).toBe('自定义错误信息');
	});
});