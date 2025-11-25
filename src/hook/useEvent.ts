import { useCallback, useRef } from 'react';

/**
 * 创建一个引用稳定的事件回调函数
 *
 * @param eventHandler 事件处理函数
 *
 * @see {@link https://github.com/react-component/util/blob/master/src/hooks/useEvent.ts} rc-util 的 useEvent 实现
 *
 *
 * @example
 * ```ts
 * const MyComponent: React.FC = () => {
 *   const [count, setCount] = useState(0);
 *   const handleClick = useEvent(() => {
 *     setCount(count + 1);
 *   });
 *
 *   return <button onClick={handleClick}>Clicked {count} times</button>;
 * };
 * ```
 */
export const useEvent = <T extends (...args: any[]) => any>(eventHandler?: T) => {
	const eventRef = useRef<T | undefined>(eventHandler);
	eventRef.current = eventHandler;

	return useCallback((...args: Parameters<T>): ReturnType<T> | undefined => {
		return eventRef.current?.(...args);
	}, []);
};