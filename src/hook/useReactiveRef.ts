import { useRef, useEffect } from 'react';

/**
 * 创建一个响应式的 ref 对象，当 prop 变化时，ref.current 也会更新
 *
 * @description 该 Hook 用于在闭包中获取最新的 prop 值，避免 stale closure 问题
 *
 * @example
 *
 * ```tsx
 * const MyComponent: React.FC<{ someProp: string }> = ({ someProp }) =>
 */
export const useReactiveRef = <T = any>(prop: T) => {
	const ref = useRef<T>(prop);

	useEffect(() => {
		ref.current = prop;
	}, [prop]);

	return ref;
};