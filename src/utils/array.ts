/**
 * 将多维对象数组转换为一维数组。
 *
 * 此函数接收一个嵌套对象数组和一个表示嵌套子数组属性名称的字符串，
 * 并递归遍历数组，将所有层级的对象提取到一个一维数组中返回。
 *
 * 该方法适用于需要扁平化树状结构数据的场景，例如生成下拉菜单、列表展示，
 * 或对树形数据进行批量操作。使用时请注意：
 *
 * - 确保传入的数据源中，每个对象在指定的 `childrenKey` 属性上要么为数组，要么为 `undefined`。
 * - 方法会递归调用，因此数据层级较深时可能会有性能影响。
 *
 * @template T 表示数组中对象的类型。
 *
 * @param data 待扁平化的多维对象数组。
 * @param childrenKey 表示嵌套子数组的属性名称，通常为 "children"。
 * @returns 返回包含所有嵌套对象的一维数组。
 *
 * @example
 * ```ts
 * interface TreeNode {
 *   id: number;
 *   name: string;
 *   children?: TreeNode[];
 * }
 *
 * const treeData: TreeNode[] = [
 *   {
 *     id: 1,
 *     name: '节点1',
 *     children: [
 *       { id: 2, name: '节点1-1' },
 *       {
 *         id: 3,
 *         name: '节点1-2',
 *         children: [
 *           { id: 4, name: '节点1-2-1' }
 *         ]
 *       }
 *     ]
 *   },
 *   { id: 5, name: '节点2' }
 * ];
 *
 * // 扁平化后得到的数组：
 * // [
 * //   { id: 1, name: '节点1', children: [...] },
 * //   { id: 2, name: '节点1-1' },
 * //   { id: 3, name: '节点1-2', children: [...] },
 * //   { id: 4, name: '节点1-2-1' },
 * //   { id: 5, name: '节点2' }
 * // ]
 * const flatData = flatten<TreeNode>(treeData, 'children');
 * console.log(flatData);
 * ```
 */
export function flatten<T>(data: T[], childrenKey: keyof T): T[] {
	const result: T[] = [];

	data.forEach(item => {
		result.push(item);
		const children = (item as any)[childrenKey] as T[] | undefined;
		if (Array.isArray(children)) {
			result.push(...flatten(children, childrenKey));
		}
	});

	return result;
}