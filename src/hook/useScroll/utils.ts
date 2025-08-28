import type { DependencyList } from 'react';
import type { TargetType, BasicTarget, TargetValue } from './typing';

/**
 * 判断 Iframe 是否可访问
 *
 * @param iframe 目标 iframe 元素
 *
 * @returns 如果 iframe 可访问则返回 true，否则返回 false
 *
 * @example
 *
 * ```ts
 * const iframe = document.getElementById('my-iframe') as HTMLIFrameElement;
 * if (canAccessIFrame(iframe)) {
 *   // 可以访问 iframe 内容
 * } else {
 *   // 不能访问 iframe 内容，可能是跨域问题
 * }
 * ```
 */
export const canAccessIFrame = (iframe: HTMLIFrameElement): boolean => {
	try {
		void iframe.contentWindow?.document?.domain;
		return true;
	} catch (error) {
		return false;
	}
};

/**
 * 获取目标元素的实际 DOM 节点。
 *
 * @param target 目标，可以是 DOM 元素、React Ref 对象，或者返回这些对象的函数
 * @param defaultElement (可选) 如果未能获取到目标元素，则返回该默认元素
 * @returns 目标元素的实际 DOM 节点，如果未能获取到则返回 `defaultElement`
 *
 * @example
 * ```ts
 * const divRef = useRef<HTMLDivElement>(null);
 * const element = getTargetElement(divRef); // 获取 ref 指向的 DOM 元素
 *
 * const funcTarget = () => document.getElementById('my-element');
 * const element2 = getTargetElement(funcTarget); // 获取函数返回的 DOM 元素
 * const element3 = getTargetElement(null, document.body); // 如果 target 为 null，则返回默认元素 document.body
 * ```
 */
export const getTargetElement = <T extends TargetType = Element>(target: BasicTarget<T>, defaultElement?: T) => {
	if (!target) {
		return defaultElement;
	}

	let targetElement: TargetValue<T>;

	if (typeof target === 'function') {
		targetElement = target();
	} else if ('current' in target) {
		targetElement = target.current;
	} else {
		targetElement = target;
	}

	return targetElement || defaultElement;
};

/**
 * 比较两个依赖项数组是否相同。
 *
 * @description 该函数用于判断两个依赖项数组的内容是否完全相同，适用于 React Hook 的依赖项比较。
 *
 * ***forked from: https://github.com/alibaba/hooks/blob/master/packages/hooks/src/utils/depsAreSame.ts#L3***
 */
export const depsAreSame = (oldDeps: DependencyList, deps: DependencyList) => {
	if (oldDeps === deps) return true;
	if (oldDeps.length !== deps.length) return false;
	for (let i = 0; i < oldDeps.length; i++) {
		if (oldDeps[i] !== deps[i]) {
			return false;
		}
	}
	return true;
};

/**
 * 获取容器滚动到子元素顶部所需的 scrollTop 值
 *
 * @param container 容器元素，可以是 HTMLElement、Document 或 Window
 * @param child 子元素，必须是 HTMLElement
 *
 * @returns 容器滚动到子元素顶部所需的 scrollTop 值
 *
 * @description `offsetTop` 在复杂布局（transform/relative/scroll-container 非 offsetParent 等）下会不准确，建议使用此方法
 *
 * @example
 *
 * ```ts
 * const container = document.getElementById('container');
 * const child = document.getElementById('child');
 * if (container && child) {
 *   const scrollTop = getScrollTopForChild(container, child);
 *   container.scrollTop = scrollTop;
 * }
 * ```
 */
export const getScrollTopForChild = (container: HTMLElement | Document | Window, child: HTMLElement) => {
	if (container === window || container === document) {
		const rect = child.getBoundingClientRect();
		return rect.top + (window.scrollY || window.pageYOffset);
	}
	const c = container as HTMLElement;
	const rect = child.getBoundingClientRect();
	const crect = c.getBoundingClientRect();
	return rect.top - crect.top + c.scrollTop; // 相对容器顶部 + 当前滚动
}