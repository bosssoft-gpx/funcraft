import { useState, useRef, useEffect } from 'react';
import type { Dispatch, SetStateAction, RefObject } from 'react';

/**
 * 一个自定义 hook，用于将 `useState` 和 `useRef` 结合，管理状态及其引用。
 *
 * 它将状态与 ref 同步，允许你在不触发重新渲染的情况下访问最新的状态值，
 * 从而避免在回调函数中因依赖状态导致函数重新创建的问题。
 *
 * @param initialState 状态的初始值。
 * @returns 返回一个数组，包含当前的状态、更新状态的 `setState` 函数以及一个保存当前状态值的 `ref`。
 *
 * @example
 * const [count, setCount, countRef] = useStateRef(0);
 *
 * const handleClick = React.useCallback(() => {
 *   console.log('当前 count 值：', countRef.current); // 通过 ref 获取最新值
 * }, [countRef]); // 使用 ref，避免依赖 count 导致回调重新创建
 *
 * return (
 *   <div>
 *     <p>Count: {count}</p>
 *     <button onClick={() => setCount(prev => prev + 1)}>增加</button>
 *     <button onClick={handleClick}>日志输出</button>
 *   </div>
 * );
 */

const useStateRef = <S>(
    initialState: S | (() => S)
): [S, Dispatch<SetStateAction<S>>, RefObject<S>] => {
    const [state, setState] = useState<S>(initialState);
    const ref = useRef<S>(state);

    useEffect(() => {
        ref.current = state;
    }, [state]);

    return [state, setState, ref] as const;
}

export default useStateRef;