// @ts-ignore-vue
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { useEffectWithTarget } from 'src';
import type { BasicTarget } from 'src';

function TestHarness(props: {
	effectImpl: () => (() => void) | void;
	deps: any[];
	target: BasicTarget<any> | BasicTarget<any>[];
}) {
	useEffectWithTarget(props.effectImpl, props.deps, props.target);
	return null;
}

describe('useEffectWithTarget', () => {
	beforeEach(() => {
		cleanup();
	});

	it('初次渲染：应执行一次 effect，不触发清理', () => {
		const el = document.createElement('div');

		const cleanups: Array<ReturnType<typeof vi.fn>> = [];
		const effectImpl = vi.fn(() => {
			const c = vi.fn();
			cleanups.push(c);
			return c;
		});

		render(<TestHarness effectImpl={effectImpl} deps={[]} target={el} />);

		expect(effectImpl).toHaveBeenCalledTimes(1);
		expect(cleanups.length).toBe(1);
		expect(cleanups[0]).not.toHaveBeenCalled();
	});

	it('依赖项变化：应执行清理并重新执行 effect', () => {
		const el = document.createElement('div');

		const cleanups: Array<ReturnType<typeof vi.fn>> = [];
		const effectImpl = vi.fn(() => {
			const c = vi.fn();
			cleanups.push(c);
			return c;
		});

		const { rerender } = render(<TestHarness effectImpl={effectImpl} deps={[0]} target={el} />);
		expect(effectImpl).toHaveBeenCalledTimes(1);

		// 依赖值变化（0 -> 1）：应触发清理 + 再次执行
		rerender(<TestHarness effectImpl={effectImpl} deps={[1]} target={el} />);

		// 上一次的 cleanup 应被调用一次
		expect(cleanups[0]).toHaveBeenCalledTimes(1);
		// effect 再次执行
		expect(effectImpl).toHaveBeenCalledTimes(2);
	});

	it('目标变化（元素引用变化）：应执行清理并重新执行 effect', () => {
		const el1 = document.createElement('div');
		const el2 = document.createElement('div');

		const cleanups: Array<ReturnType<typeof vi.fn>> = [];
		const effectImpl = vi.fn(() => {
			const c = vi.fn();
			cleanups.push(c);
			return c;
		});

		const { rerender } = render(<TestHarness effectImpl={effectImpl} deps={[]} target={el1} />);
		expect(effectImpl).toHaveBeenCalledTimes(1);

		// target 换成另一个元素引用
		rerender(<TestHarness effectImpl={effectImpl} deps={[]} target={el2} />);

		expect(cleanups[0]).toHaveBeenCalledTimes(1);
		expect(effectImpl).toHaveBeenCalledTimes(2);
	});

	it('目标为 ref：更换 ref 对象本身（而非 current）应触发重新执行', () => {
		const el1 = document.createElement('div');
		const el2 = document.createElement('div');

		const ref1 = React.createRef<HTMLDivElement>();
		const ref2 = React.createRef<HTMLDivElement>();
		ref1.current = el1;
		ref2.current = el2;

		const cleanups: Array<ReturnType<typeof vi.fn>> = [];
		const effectImpl = vi.fn(() => {
			const c = vi.fn();
			cleanups.push(c);
			return c;
		});

		const { rerender } = render(<TestHarness effectImpl={effectImpl} deps={[]} target={ref1} />);
		expect(effectImpl).toHaveBeenCalledTimes(1);

		// 注意：仅更新 ref.current 不会触发 effect 依赖变化，需更换 ref 对象本身
		rerender(<TestHarness effectImpl={effectImpl} deps={[]} target={ref2} />);

		expect(cleanups[0]).toHaveBeenCalledTimes(1);
		expect(effectImpl).toHaveBeenCalledTimes(2);
	});

	it('目标为 ref：更换 current 也会触发重新执行', () => {
		const el1 = document.createElement('div');
		const el2 = document.createElement('div');
		const ref = React.createRef<HTMLDivElement>();
		ref.current = el1;
		const cleanups: Array<ReturnType<typeof vi.fn>> = [];
		const effectImpl = vi.fn(() => {
			const c = vi.fn();
			cleanups.push(c);
			return c;
		});
		const { rerender } = render(<TestHarness effectImpl={effectImpl} deps={[]} target={ref} />);
		expect(effectImpl).toHaveBeenCalledTimes(1);
		// 仅更换 ref.current
		ref.current = el2;
		rerender(<TestHarness effectImpl={effectImpl} deps={[]} target={ref} />);
		expect(effectImpl).toHaveBeenCalledTimes(2);
		expect(cleanups[0]).toHaveBeenCalledTimes(1);
	});

	it('目标为函数：当函数引用变化时应重新执行', () => {
		const el1 = document.createElement('div');
		const el2 = document.createElement('div');

		const targetFn1 = () => el1;
		const targetFn2 = () => el2;

		const cleanups: Array<ReturnType<typeof vi.fn>> = [];
		const effectImpl = vi.fn(() => {
			const c = vi.fn();
			cleanups.push(c);
			return c;
		});

		const { rerender } = render(<TestHarness effectImpl={effectImpl} deps={[]} target={targetFn1} />);
		expect(effectImpl).toHaveBeenCalledTimes(1);

		// 更换 target 函数引用
		rerender(<TestHarness effectImpl={effectImpl} deps={[]} target={targetFn2} />);

		expect(cleanups[0]).toHaveBeenCalledTimes(1);
		expect(effectImpl).toHaveBeenCalledTimes(2);
	});

	it('目标为多个元素数组：数组内容变化应触发重新执行', () => {
		const a = document.createElement('div');
		const b = document.createElement('div');
		const c = document.createElement('div');

		const cleanups: Array<ReturnType<typeof vi.fn>> = [];
		const effectImpl = vi.fn(() => {
			const cx = vi.fn();
			cleanups.push(cx);
			return cx;
		});

		const { rerender } = render(
			<TestHarness effectImpl={effectImpl} deps={[]} target={[a, b] as BasicTarget<any>[]} />
	);
		expect(effectImpl).toHaveBeenCalledTimes(1);

		// 数组内容变化（b -> c）
		rerender(
			<TestHarness effectImpl={effectImpl} deps={[]} target={[a, c] as BasicTarget<any>[]} />
	);

		expect(cleanups[0]).toHaveBeenCalledTimes(1);
		expect(effectImpl).toHaveBeenCalledTimes(2);
	});

	it('目标与依赖均未变化：重复渲染不应重新执行 effect', () => {
		const el = document.createElement('div');

		const cleanups: Array<ReturnType<typeof vi.fn>> = [];
		const effectImpl = vi.fn(() => {
			const c = vi.fn();
			cleanups.push(c);
			return c;
		});

		const { rerender } = render(<TestHarness effectImpl={effectImpl} deps={[1, 'x']} target={el} />);
		expect(effectImpl).toHaveBeenCalledTimes(1);

		// 传入“相同值”的依赖（注意：useEffectWithTarget 内部将依赖拆到 [target, ...deps]）
		rerender(<TestHarness effectImpl={effectImpl} deps={[1, 'x']} target={el} />);
		expect(effectImpl).toHaveBeenCalledTimes(1);
		expect(cleanups[0]).not.toHaveBeenCalled();
	});

	it('卸载组件：应调用最后一次的清理函数', () => {
		const el = document.createElement('div');

		const cleanups: Array<ReturnType<typeof vi.fn>> = [];
		const effectImpl = vi.fn(() => {
			const c = vi.fn();
			cleanups.push(c);
			return c;
		});

		const { unmount, rerender } = render(<TestHarness effectImpl={effectImpl} deps={[0]} target={el} />);

		// 更改依赖，触发一次切换
		rerender(<TestHarness effectImpl={effectImpl} deps={[1]} target={el} />);
		expect(cleanups[0]).toHaveBeenCalledTimes(1);
		expect(effectImpl).toHaveBeenCalledTimes(2);

		// 卸载时应调用最后一次的 cleanup
		unmount();
		expect(cleanups[1]).toHaveBeenCalledTimes(1);
	});
});
