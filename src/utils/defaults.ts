/**
 * 用于获取多个值时提供默认值的获取方法。
 * 如果原始值为 `null` 或 `undefined`，则返回第一个有值的参数。
 *
 * @param values 一个或多个原始值，可以是任意类型，可能为 `null` 或 `undefined`。
 * @returns 返回第一个非 `null` 或 `undefined` 的值，如果没有则返回最后的默认值。
 *
 * @example
 * const result1 = defaultGetter(null, undefined, '默认值'); // 返回 '默认值'
 * const result2 = defaultGetter(null, '实际值', '默认值'); // 返回 '实际值'
 * const result3 = defaultGetter(undefined, '有效值', '默认值'); // 返回 '有效值'
 */
export const defaultGetter = <T>(...values: (T | undefined | null)[]): T => {
    for (let value of values) {
        if (value !== null && value !== undefined) {
            return value;
        }
    }
    // 如果所有值都是 null 或 undefined，返回最后一个参数作为默认值
    return values[values.length - 1] as T;
};


/**
 * 对源对象进行默认值合并处理的方法。
 * 如果源对象为 `null` 或 `undefined`，则返回默认对象的副本。
 * 否则，会递归地将源对象与默认对象合并，源对象的 `undefined` 或 `null` 属性将使用默认对象中的对应值。
 *
 * @param source 源对象，可以是任何类型，但可能为 `null` 或 `undefined`。
 * @param defaultObj 默认对象，作为合并的默认值来源。
 * @returns 返回合并后的对象，未定义或 `null` 的属性会被默认对象中的值覆盖。
 *
 * @example
 * const result = defaultMerge({ name: 'Alice' }, { name: 'Unknown', age: 30 });
 * // 返回 { name: 'Alice', age: 30 }
 *
 * const result2 = defaultMerge(null, { name: 'Unknown', age: 30 });
 * // 返回 { name: 'Unknown', age: 30 }
 */
export const defaultMerge = <T>(source: T | null | undefined, defaultObj: Partial<T>): T => {
    if (source === null || source === undefined) {
        return { ...defaultObj } as T;
    }

    const result = { ...source };
    const keyList = Object.keys({ ...source, ...defaultObj }) as Array<keyof T>;
    keyList.forEach(key => {
        const sourceValue = source[key];
        const defaultValue = defaultObj[key];

        if (
            sourceValue !== null &&
            defaultValue !== null &&
            typeof sourceValue === 'object' &&
            !Array.isArray(sourceValue) &&
            typeof defaultValue === 'object' &&
            !Array.isArray(defaultValue)
        ) {
            result[key] = defaultMerge(sourceValue, defaultValue);
        } else if (sourceValue === undefined || sourceValue === null) {
            // @ts-ignore
            result[key] = defaultValue;
        }
    });

    return result;
};

/**
 * 深度提取对象中多层属性的类型。
 *
 * @template T 源对象类型。
 * @template Keys 属性键组成的元组，表示需要读取的嵌套路径。
 *
 * 如果给定的键在对象中存在，则返回对应的嵌套属性类型，否则返回 undefined。
 */
type DeepValue<
    T,
    Keys extends readonly PropertyKey[]
> = Keys extends [infer K, ...infer Rest]
    ? K extends keyof T
        ? Rest extends readonly PropertyKey[]
            ? DeepValue<T[K], Rest>
            : T[K]
        : undefined
    : T;

/**
 * 安全地从对象中获取深层嵌套的属性值。
 *
 * 此函数接收一个对象以及任意数量的键，并按照给定的键路径依次访问对象属性。
 * 如果在访问过程中遇到 `null` 或 `undefined`，则返回 `undefined`。
 *
 * 该工具函数特别适用于 **不支持可选链操作符（?.）** 的运行环境。
 *
 * @template T 源对象的类型。
 * @template Keys 表示属性路径的键的元组类型。
 *
 * @param source 要从中读取嵌套属性的对象。
 * @param keys 一系列表示嵌套属性路径的键。
 * @returns 如果嵌套属性存在，则返回其值；否则返回 `undefined`。
 *
 * @example
 * ```ts
 * interface Data {
 *   a?: {
 *     b?: {
 *       c: number;
 *     };
 *   };
 * }
 *
 * const obj: Data = { a: { b: { c: 42 } } };
 *
 * // 返回 42
 * const result1 = call(obj, 'a', 'b', 'c');
 *
 * // 返回 undefined，因为属性 'd' 不存在
 * const result2 = call(obj, 'a', 'd', 'c');
 * ```
 */

export function deepGet<T, Keys extends readonly PropertyKey[]>(
    source: T,
    ...keys: Keys
): DeepValue<T, Keys> | undefined {
    let result: any = source;
    for (const key of keys) {
        if (result == null) return undefined;
        result = result[key];
    }
    return result;
}
