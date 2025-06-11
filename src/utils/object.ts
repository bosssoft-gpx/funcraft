/**
 * 从对象中排除指定的字段，返回一个新的对象，保留原对象中未被排除的字段。
 *
 * @template T 原始对象的类型。
 * @template K 要排除的字段的键名集合，必须是 T 的键之一。
 *
 * @param obj 原始对象。
 * @param fields 要从对象中排除的字段名数组。
 * @returns 返回一个新对象，包含原对象中除排除字段之外的所有字段。
 *
 * @example
 * const original = { a: 1, b: 2, c: 3 };
 * const result = omit(original, ['b']);
 * // result = { a: 1, c: 3 }
 *
 * @example
 * interface Props {
 *   name: string;
 *   age: number;
 *   password: string;
 * }
 * const props: Props = { name: 'Tom', age: 30, password: 'secret' };
 * const safeProps = omit(props, ['password']);
 * // safeProps 类型为 { name: string; age: number }
 */
export const omit = <T extends object, K extends keyof T>(
	obj: T,
	fields: K[] | readonly K[],
): Omit<T, K> => {
	const clone = Object.assign({}, obj);

	if (Array.isArray(fields)) {
		fields.forEach(key => {
			delete clone[key];
		});
	}

	return clone;
};