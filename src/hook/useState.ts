// Description: A safe version of useState that avoids setting state on unmounted components.
// Forked from rc-util@5.40.0 useSafeState
// License: MIT
// Original source: https://github.com/react-component/util/blob/master/src/hooks/useState.ts
// Copyrights: rc-util contributors.
// Modified For Funcraft:
// - 调整代码风格以符合 Funcraft 规范。
// - 增强类型定义和注释。
// --------------------------------------------------------------------------------------------

import { useRef, useState as useReactState, useEffect } from 'react';

type Updater<T> = T | ((prevValue: T) => T);

export type SetState<T> = (
	nextValue: Updater<T>,
	/**
	 * Will not update state when destroyed.
	 * Developer should make sure this is safe to ignore.
	 */
	ignoreDestroy?: boolean,
) => void;

/**
 * 一个带「卸载安全保护」的 `useState` 替代方案。
 *
 * @description
 * 此 Hook 借鉴自 rc-util 的实现，并根据 Funcraft 的需求进行了调整。
 * 与原生 `React.useState` 基本一致，但返回的 `setState` 额外支持一个
 * `ignoreDestroy` 参数，用于在组件已经卸载时跳过本次状态更新，从而避免：
 *
 * - 在组件卸载后调用 `setState` 触发 React 警告；
 * - 某些异步回调（定时器、Promise、事件监听）在组件销毁后仍尝试更新状态。
 *
 * 与其自动吞掉所有卸载后的更新，`useSafeState` 更强调「显式确认」：
 * 需要开发者在调用时根据具体场景传入 `ignoreDestroy`，
 * 只有在确认某次更新可以在组件销毁时安全忽略时，才使用该参数。
 *
 * Same as `React.useState` but `setState` accepts an extra `ignoreDestroy` param
 * to skip state updates after the component is destroyed.
 * We do not make this behavior automatic in order to avoid hiding real memory leaks.
 * Developers should explicitly confirm it's safe to ignore such updates.
 *
 *
 * @returns 一个数组，结构与 `useState` 类似，但 `setState` 的签名有所扩展：
 * - `state`: 当前状态值；
 * - `setState`: 状态更新函数，除了支持 `setState(next)` / `setState(prev => next)`，
 *   还可以传入第二个布尔参数 `ignoreDestroy`：
 *   - 当 `ignoreDestroy === true` 且组件已卸载时，本次更新会被跳过；
 *   - 当不传或为 `false` 时，行为与原生 `setState` 一致。
 *
 * @example
 * ```ts
 * // 在异步请求中使用，避免组件卸载后继续 setState
 * const [data, setData] = useSafeState<string | null>(null);
 *
 * useEffect(() => {
 *   let canceled = false;
 *
 *   fetch('/api/data')
 *     .then(res => res.text())
 *     .then(text => {
 *       if (!canceled) {
 *         // 这里传入 ignoreDestroy = true：
 *         // 如果组件已经卸载，则本次更新会被安全忽略
 *         setData(text, true);
 *       }
 *     });
 *
 *   return () => {
 *     canceled = true;
 *   };
 * }, []);
 *
 * // 普通场景下：完全可以当作 useState 使用
 * const [count, setCount] = useSafeState(0);
 *
 * const inc = () => setCount(prev => prev + 1); // 不需要额外的 ignoreDestroy
 * ```
 */
function useSafeState<T>(
	defaultValue?: T | (() => T),
): [T, SetState<T>] {
	const destroyRef = useRef(false);
	const [value, setValue] = useReactState(defaultValue);

	useEffect(() => {
		destroyRef.current = false;

		return () => {
			destroyRef.current = true;
		};
	}, []);

	function safeSetState(updater: Updater<T>, ignoreDestroy?: boolean) {
		if (ignoreDestroy && destroyRef.current) {
			return;
		}

		// @ts-ignore
		setValue(updater);
	}

	return [value as T, safeSetState];
}

export { useSafeState, useSafeState as useState };