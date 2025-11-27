// Description: A state hook that merges controlled and uncontrolled state.
// Forked from rc-util@5.40.0 useMergedState
// License: MIT
// Original source: https://github.com/react-component/util/blob/master/src/hooks/useMergedState.ts
// Copyrights: rc-util contributors.
// Modified For Funcraft:
// - 调整代码风格以符合 Funcraft 规范。
// - 增强类型定义和注释。
// --------------------------------------------------------------------------------------------

import { useLayoutEffect } from 'react';
import { useEvent } from './useEvent';
import { useState } from './useState';

type Updater<T> = (
	updater: T | ((origin: T) => T),
	ignoreDestroy?: boolean,
) => void;

/** We only think `undefined` is empty */
function hasValue(value: any) {
	return value !== undefined;
}

/**
 *
 *
 * @deprecated Please use `useControlledState` instead if not need support < React 18.
 * Similar to `useState` but will use props value if provided.
 * Note that internal use rc-util `useState` hook.
 */

/**
 * 一个用于统一管理「受控值」与「非受控值」的通用状态 Hook。
 *
 * 它封装了组件中常见的 `value` / `defaultValue` / 内部状态三者之间的合并逻辑：
 *
 * - 当传入 `options.value` 时，Hook 进入**受控模式**，对外值始终以 `value` 为准；
 * - 当未传入 `options.value` 时，Hook 进入**非受控模式**，对外值来源于内部 `state`，
 *   初始值优先使用 `options.defaultValue`，否则使用 `defaultStateValue`；
 * - 每次状态更新时，若提供了 `options.onChange`，会在内部状态变化后调用，
 *   传入最新值与前一次值，便于组件对外透出变化。
 *
 * 同时，你可以通过 `options.postState` 在对外暴露之前对合并后的值做一次映射，
 * 用于格式化、兜底或从内部原始值派生出适合视图渲染的值。
 *
 * @typeParam T 原始状态值类型（内部存储与更新使用的类型）。
 * @typeParam R 对外暴露的状态值类型，默认为 `T`。当提供 `postState` 时，可用于指定映射后的类型。
 *
 * @param defaultStateValue 内部状态的兜底初始值：
 * - 若未传入 `options.value` 和 `options.defaultValue`，则使用该值初始化内部状态；
 * - 支持直接传值或惰性初始化函数 `() => T`。
 * @param option 可选配置项对象，包含：
 * - `defaultValue?: T | (() => T)`：非受控模式下的初始值，支持直接传值或惰性初始化函数；
 * - `value?: T`：受控模式下的值，传入则覆盖内部状态；
 * - `onChange?: (value: T, prevValue: T) => void`：状态变更回调，每次内部状态更新后调用，传入最新值与前一次值；
 * - `postState?: (value: T) => R`：对外暴露值的映射函数，在返回给调用者之前对合并后的值进行转换。
 *
 * @returns 返回一个元组：
 * - 第一个元素是对外暴露的当前值（类型为 `R`，若未提供 `postState`，则为原始值 `T`）；
 * - 第二个元素是用于更新内部值的 `setState` 函数，签名与 `React.Dispatch<SetStateAction<T>>` 一致。
 *
 * @deprecated Please use `useControlledState` instead if not need support < React 18.
 * Similar to `useState` but will use props value if provided.
 * Note that internal use rc-util `useState` hook.
 *
 * @example
 * ```ts
 * // 非受控用法：支持 defaultValue
 * const [value, setValue] = useMergedState<string>('', {
 *   defaultValue: '初始文本',
 * });
 *
 * // 受控用法：由父组件完全控制 value
 * interface InputProps {
 *   value?: string;
 *   onChange?: (next: string) => void;
 * }
 *
 * const MyInput: React.FC<InputProps> = props => {
 *   const [value, setValue] = useMergedState<string>('', {
 *     value: props.value,
 *     onChange: (next) => props.onChange?.(next),
 *   });
 *
 *   return (
 *     <input
 *       value={value}
 *       onChange={e => setValue(e.target.value)}
 *     />
 *   );
 * };
 *
 * // 使用 postState 将内部 Date 映射为时间戳，方便视图层使用
 * const [timestamp, setDate] = useMergedState<Date | null, number | null>(null, {
 *   value: props.value, // Date | null
 *   onChange: (nextDate) => props.onChange?.(nextDate),
 *   postState: date => (date ? date.getTime() : null),
 * });
 *
 * // 这里 timestamp 的类型为 number | null，适合直接用于展示或传给其他组件
 * ```
 */
export function useMergedState<T, R = T>(
	defaultStateValue: T | (() => T),
	option?: {
		defaultValue?: T | (() => T);
		value?: T;
		onChange?: (value: T, prevValue: T) => void;
		postState?: (value: T) => T;
	},
): [R, Updater<T>] {
	const { defaultValue, value, onChange, postState } = option || {};

	// ======================= Init =======================
	const [innerValue, setInnerValue] = useState<T>(() => {
		if (hasValue(value)) {
			return value;
		} else if (hasValue(defaultValue)) {
			return typeof defaultValue === 'function'
				? (defaultValue as any)()
				: defaultValue;
		} else {
			return typeof defaultStateValue === 'function'
				? (defaultStateValue as any)()
				: defaultStateValue;
		}
	});

	const mergedValue = value !== undefined ? value : innerValue;
	const postMergedValue = postState ? postState(mergedValue) : mergedValue;

	// ====================== Change ======================
	const onChangeFn = useEvent(onChange);

	const [prevValue, setPrevValue] = useState<[T]>([mergedValue]);

	useLayoutEffect(() => {
		const prev = prevValue[0];
		if (innerValue !== prev) {
			onChangeFn(innerValue, prev);
		}
	}, [prevValue]);

	// Sync value back to `undefined` when it from control to un-control
	useLayoutEffect(() => {
		if (!hasValue(value)) {
			// @ts-ignore
			setInnerValue(value);
		}
	}, [value]);

	// ====================== Update ======================
	const triggerChange: Updater<T> = useEvent((updater, ignoreDestroy) => {
		setInnerValue(updater, ignoreDestroy);
		setPrevValue([mergedValue], ignoreDestroy);
	});

	return [postMergedValue as unknown as R, triggerChange];
}