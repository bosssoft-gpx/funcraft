import { describe, it, expect } from 'vitest';
import { omit } from 'src';

describe('omit 函数', () => {
	it('should omit a single field', () => {
		const input = { a: 1, b: 2, c: 3 };
		const result = omit(input, ['b']);
		expect(result).toEqual({ a: 1, c: 3 });
	});

	it('should omit multiple fields', () => {
		const input = { a: 1, b: 2, c: 3, d: 4 };
		const result = omit(input, ['b', 'd']);
		expect(result).toEqual({ a: 1, c: 3 });
	});

	it('should return the original object if fields array is empty', () => {
		const input = { a: 1, b: 2 };
		const result = omit(input, []);
		expect(result).toEqual({ a: 1, b: 2 });
	});

	it('should not mutate the original object', () => {
		const input = { a: 1, b: 2 };
		const clone = { ...input };
		omit(input, ['b']);
		expect(input).toEqual(clone);
	});

	it('should work with readonly arrays', () => {
		const input = { a: 1, b: 2, c: 3 };
		const readonlyFields = ['a', 'c'] as const;
		const result = omit(input, readonlyFields);
		expect(result).toEqual({ b: 2 });
	});

	it('should return an empty object if all fields are omitted', () => {
		const input = { x: 1 };
		const result = omit(input, ['x']);
		expect(result).toEqual({});
	});

	it('should ignore fields not present in object (safely)', () => {
		const input = { a: 1, b: 2 };
		const result = omit(input, ['c' as any]);
		expect(result).toEqual({ a: 1, b: 2 });
	});
});
