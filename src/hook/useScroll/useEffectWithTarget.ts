import { useRef, useEffect } from 'react';
import { getTargetElement, depsAreSame } from './utils';

import type { DependencyList, EffectCallback } from 'react';
import type { BasicTarget } from './typing';

/**
 * 一个自定义的 React Hook，用于在指定的目标元素上执行副作用函数，并在依赖项或目标元素变化时重新执行该函数。
 *
 * @description 该 Hook 类似于 `useEffect`，但它允许你指定一个或多个目标元素（可以是 DOM 元素、React Ref 对象，或者返回这些对象的函数）。
 * 当依赖项或目标元素发生变化时，副作用函数会被重新执行。
 *
 * ***forked from: https://github.com/alibaba/hooks/blob/master/packages/hooks/src/utils/createEffectWithTarget.ts#L15***
 */
export const useEffectWithTarget = (effect: EffectCallback, deps: DependencyList, target: BasicTarget<any> | BasicTarget<any>[]) => {
	const hasInitRef = useRef(false);

	const lastElementRef = useRef<(Element | null)[]>([]);
	const lastDepsRef = useRef<DependencyList>([]);

	const unLoadRef = useRef<any>(undefined);

	useEffect(() => {
		const targets = Array.isArray(target) ? target : [target];
		const els = targets.map((item) => getTargetElement(item));

		// init run
		if (!hasInitRef.current) {
			hasInitRef.current = true;
			lastElementRef.current = els;
			lastDepsRef.current = deps;

			unLoadRef.current = effect();
			return;
		}

		if (
			els.length !== lastElementRef.current.length ||
			!depsAreSame(lastElementRef.current, els) ||
			!depsAreSame(lastDepsRef.current, deps)
		) {
			unLoadRef.current?.();

			lastElementRef.current = els;
			lastDepsRef.current = deps;
			unLoadRef.current = effect();
		}

		return () => {
			unLoadRef.current?.();
			// for react-refresh
			hasInitRef.current = false;
		};
	});
};