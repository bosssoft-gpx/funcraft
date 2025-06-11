/**
 * 比较两个语义化版本字符串
 * @param v1 第一个版本
 * @param v2 第二个版本
 * @returns 如果 v1 > v2 返回 1，v1 < v2 返回 -1，相等返回 0
 */
const compareVersion = (v1: string, v2: string): number => {
	const s1 = v1.split('.').map(Number);
	const s2 = v2.split('.').map(Number);
	const len = Math.max(s1.length, s2.length);
	for (let i = 0; i < len; i++) {
		const a = s1[i] || 0;
		const b = s2[i] || 0;
		if (a > b) return 1;
		if (a < b) return -1;
	}
	return 0;
};


/**
 * 安全地注册 Element-UI 组件，支持自动判断是否需要注册（避免版本不一致或未注册带来的问题）。
 * 支持手动声明组件名，也支持自动从组件的 `.name` 字段中提取。
 *
 * @param Vue Vue 构造函数。
 * @param components 组件对象，可为具名对象（{ ElButton: Button }）或简写对象（{ Button }）。
 * @param options 可选配置项，如最低 Element UI 版本阈值。
 *
 * @returns 一个组件对象，可直接用于 `components: { ... }`
 *
 * @example
 * import Vue from 'vue';
 * import { Button, Dialog } from 'element-ui';
 * import { safeRegisterComponents } from '@gpx/common-funcraft';
 *
 * export default {
 *   components: {
 *     ...safeRegisterComponents(Vue, { Button, Dialog })
 *   }
 * }
 */
export const safeRegisterComponents = (
	Vue: typeof import('vue'),
	components: Record<string, any>,
	options?: {
		versionThreshold?: string
	}
): Record<string, any> => {
	const { versionThreshold = '2.15.0' } = options || {};

	if (!Vue || !components) return {};

	// @ts-ignore
	const elVersion = Vue.prototype?.$ELEMENT?.version;
	const isVersionLow = elVersion && compareVersion(elVersion, versionThreshold) < 0;

	// 映射出组件名 => 组件 的结构
	const resolvedComponents: Record<string, any> = {};
	Object.entries(components).forEach(([key, comp]) => {
		const name = comp?.name || key;
		resolvedComponents[name] = comp;
	});

	const shouldRegister = isVersionLow || Object.keys(resolvedComponents).some(name => {
		// @ts-ignore
		return !Vue.options.components?.[name];
	});

	return shouldRegister ? resolvedComponents : {};
};
