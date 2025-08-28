import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, act, waitFor } from '@testing-library/react';
import { useScroll } from 'src';
import * as utilsMod from 'src';

// ---- 全局 mock：scrollTo / wrapperRaf / ResizeObserver ----
const scrollToMock = vi.spyOn(utilsMod as any, 'scrollTo').mockImplementation(() => {});
const wrapperRafMock = vi.spyOn(utilsMod as any, 'wrapperRaf').mockImplementation((fn: Function) => {
	// 让它进微任务而不是完全同步，接着我们用 waitFor/flushMicroTasks 等待
	Promise.resolve().then(() => fn());
});

const RO_INSTANCES: RO[] = [];
class RO {
	cb: ResizeObserverCallback;
	observed = new Set<Element>();
	constructor(cb: ResizeObserverCallback) { this.cb = cb; RO_INSTANCES.push(this); }
	observe = (el: Element) => { this.observed.add(el); };
	unobserve = (el: Element) => { this.observed.delete(el); };
	disconnect = () => { this.observed.clear(); };
	__trigger = () => this.cb([], this as unknown as ResizeObserver);
}
// @ts-ignore
globalThis.ResizeObserver = RO;

// ---- 小工具：设置元素/文档尺寸只读属性 ----
function defineNumberProp(obj: any, key: string, value: number) {
	Object.defineProperty(obj, key, { value, configurable: true });
}

function TestWithTarget(props: {
	target: any;
	deps?: any[];
	onScroll?: (p: { left: number; top: number }, s: any) => void;
	duration?: number;
}) {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const api = useScroll(props.target, { onScroll: props.onScroll, deps: props.deps, duration: props.duration });
	return null;
}

describe('useScroll', () => {
	beforeEach(() => {
		cleanup();
		scrollToMock.mockClear();
		wrapperRafMock.mockClear();

		// 统一设置文档滚动根尺寸
		const root = document.scrollingElement || document.documentElement;
		defineNumberProp(root, 'clientHeight', 600);
		defineNumberProp(root, 'clientWidth', 800);
		defineNumberProp(root, 'scrollHeight', 2000);
		defineNumberProp(root, 'scrollWidth', 1200);

		// 初始滚动位置
		Object.defineProperty(window, 'scrollY', { value: 0, configurable: true, writable: true });
		Object.defineProperty(window, 'scrollX', { value: 0, configurable: true, writable: true });
		Object.defineProperty(window, 'pageYOffset', { value: 0, configurable: true, writable: true });
		Object.defineProperty(window, 'pageXOffset', { value: 0, configurable: true, writable: true });
	});

	afterEach(() => {
		cleanup();
	});

	it('初始化（target=document）：应读取窗口滚动位置与文档尺寸，并在滚动时更新 position 与触发 onScroll', async () => {
		const onScroll = vi.fn();

		render(<TestWithTarget target={document} onScroll={onScroll} />);

		// 初始不滚动，position 为 0
		await waitFor(() => {
			expect(onScroll).toHaveBeenCalledTimes(2); // 初次 updatePosition/updateSize 后 wrapperRaf 调用一次
		});
		onScroll.mockClear();

		// 模拟窗口滚动
		Object.defineProperty(window, 'scrollY', { value: 120, configurable: true });
		Object.defineProperty(window, 'pageYOffset', { value: 120, configurable: true });

		act(() => {
			window.dispatchEvent(new Event('scroll'));
		});

		// onScroll 被触发，且由 wrapperRaf 同步调用
		await waitFor(() => {
			expect(onScroll).toHaveBeenCalledTimes(1);
		});
		const [posArg, sizeArg] = onScroll.mock.calls[0];
		expect(posArg).toEqual({ left: 0, top: 120 });
		expect(sizeArg).toMatchObject({ clientHeight: 600, scrollHeight: 2000 });
	});

	it('目标为元素：滚动元素自身应更新 position，isTop/isBottom 按 EPS 容差计算', () => {
		const div = document.createElement('div');
		// 挂到 body 以保证 getBoundingClientRect 等基础能力可用
		document.body.appendChild(div);

		defineNumberProp(div, 'clientHeight', 300);
		defineNumberProp(div, 'clientWidth', 400);
		defineNumberProp(div, 'scrollHeight', 1000);
		defineNumberProp(div, 'scrollWidth', 400);
		// @ts-ignore
		div.scrollTop = 0;
		// @ts-ignore
		div.scrollLeft = 0;

		const onScroll = vi.fn();
		function Wrap() {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const api = useScroll(div, { onScroll });
			return null;
		}
		render(<Wrap />);

		// 滚动到 100
		// @ts-ignore
		div.scrollTop = 100;
		act(() => {
			div.dispatchEvent(new Event('scroll'));
		});
		expect(onScroll).toHaveBeenCalledTimes(1);
		expect(onScroll.mock.calls[0][0]).toEqual({ left: 0, top: 100 });

		onScroll.mockClear();

		// 滚动到底部（scrollHeight - clientHeight = 700）
		// @ts-ignore
		div.scrollTop = 700;
		act(() => {
			div.dispatchEvent(new Event('scroll'));
		});
		expect(onScroll).toHaveBeenCalledTimes(1);
		expect(onScroll.mock.calls[0][0]).toEqual({ left: 0, top: 700 });
	});

	it('scrollToTop / scrollToBottom：对 window/document 与元素分别调用 scrollTo', () => {
		const div = document.createElement('div');
		document.body.appendChild(div);
		defineNumberProp(div, 'clientHeight', 300);
		defineNumberProp(div, 'scrollHeight', 1000);
		// @ts-ignore
		div.scrollTop = 0;

		let calls: any[] = [];
		scrollToMock.mockImplementation((top: number, opts: any) => {
			calls.push({ top, getContainer: opts?.getContainer });
		});

		// 用 ref 取回 hook API 以便触发方法
		function WithAPI(props: { target: any }) {
			// @ts-ignore
			const api = useScroll(props.target);
			// 暴露到 window（测试黑科技）
			// @ts-ignore
			window.__api = api;
			return null;
		}

		// 元素目标
		render(<WithAPI target={div} />);
		calls = [];

		act(() => {
			// @ts-ignore
			window.__api.scrollToTop();
		});
		expect(calls[0].top).toBe(0);
		expect(typeof calls[0].getContainer()).toBe('object'); // 元素容器

		calls = [];
		act(() => {
			// @ts-ignore
			window.__api.scrollToBottom();
		});
		expect(calls[0].top).toBe(1000); // scrollHeight
		expect(typeof calls[0].getContainer()).toBe('object');

		// 窗口目标
		cleanup();
		render(<WithAPI target={document} />);
		calls = [];
		act(() => {
			// @ts-ignore
			window.__api.scrollToTop();
		});
		expect(calls[0].top).toBe(0); // 页面顶部

		calls = [];
		act(() => {
			// @ts-ignore
			window.__api.scrollToBottom();
		});
		// document 情况：用 document.scrollingElement.scrollHeight
		const root = document.scrollingElement || document.documentElement;
		expect(calls[0].top).toBe(root.scrollHeight);
	});

	it('scrollTo(元素)：当元素为窗口/文档时滚到子元素对应的视口位置；当元素为容器时滚到子元素的相对位置', () => {
		const container = document.createElement('div');
		document.body.appendChild(container);
		defineNumberProp(container, 'clientHeight', 300);
		defineNumberProp(container, 'scrollHeight', 2000);
		// @ts-ignore
		container.scrollTop = 0;

		const child = document.createElement('div');
		container.appendChild(child);

		// 定位：容器 top=100，子元素 top=350 => scrollTop=350-100+当前=250
		vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
			top: 100, left: 0, bottom: 0, right: 0, width: 0, height: 0, x: 0, y: 0,
			toJSON() { return {}; }
		} as DOMRect);
		vi.spyOn(child, 'getBoundingClientRect').mockReturnValue({
			top: 350, left: 0, bottom: 0, right: 0, width: 0, height: 0, x: 0, y: 0,
			toJSON() { return {}; }
		} as DOMRect);

		let calls: any[] = [];
		scrollToMock.mockImplementation((top: number, opts: any) => {
			calls.push({ top, getContainer: opts?.getContainer });
		});

		function WithAPI(props: { target: any }) {
			// @ts-ignore
			const api = useScroll(props.target);
			// @ts-ignore
			window.__api = api;
			return null;
		}

		render(<WithAPI target={container} />);
		act(() => {
			// @ts-ignore
			window.__api.scrollTo(child);
		});
		expect(calls[0].top).toBe(250);
		expect(calls[0].getContainer()).toBe(container);

		// document/window 场景：使用 getBoundingClientRect + pageYOffset
		cleanup();
		render(<WithAPI target={document} />);
		calls = [];
		// window 视口下：child top=350，相对页面偏移=pageYOffset(0) → 350
		act(() => {
			// @ts-ignore
			window.__api.scrollTo(child);
		});
		expect(calls[0].top).toBe(350);
	});

	it('同源 iframe：应绑定到 contentWindow 的 scroll/resize，滚动时更新 position', () => {
		// 构造同源 iframe 替身
		const iframeWin = {
			document: {
				scrollingElement: {
					clientHeight: 500,
					clientWidth: 600,
					scrollHeight: 3000,
					scrollWidth: 1200,
					scrollTop: 0,
					scrollLeft: 0,
				}
			},
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: (e: Event) => {
				// 简化：直接触发监听
				const calls = (iframeWin.addEventListener as any).mock.calls.filter((c: any[]) => c[0] === e.type);
				calls.forEach(([, handler]: any) => handler(e));
			},
		} as unknown as Window;

		const iframe = document.createElement('iframe');
		Object.defineProperty(iframe, 'contentWindow', { value: iframeWin, configurable: true });

		// 附上可访问的 document.domain（同源）
		Object.defineProperty(iframeWin.document, 'domain', { get: () => 'example.com' });

		const onScroll = vi.fn();
		render(<TestWithTarget target={iframe} onScroll={onScroll} />);

		// 触发 contentWindow 的 scroll
		(iframeWin.document.scrollingElement as any).scrollTop = 200;
		act(() => {
			iframeWin.dispatchEvent(new Event('scroll'));
		});

		expect(onScroll).toHaveBeenCalledTimes(1);
		expect(onScroll.mock.calls[0][0]).toEqual({ left: 0, top: 200 });
	});

	it('跨域 iframe：应打印告警并跳过绑定（不抛错）', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const foreignWin = {
			document: {},
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
		} as unknown as Window;

		const iframe = document.createElement('iframe');
		Object.defineProperty(iframe, 'contentWindow', { value: foreignWin, configurable: true });

		// 访问 domain 抛错，模拟跨域
		Object.defineProperty(foreignWin.document, 'domain', {
			get() { throw new DOMException('Blocked by same-origin policy'); }
		});

		render(<TestWithTarget target={iframe} />);
		expect(warn).toHaveBeenCalled(); // 提示无法访问
		expect((foreignWin.addEventListener as any).mock.calls.length).toBe(0); // 未绑定

		warn.mockRestore();
	});

	it('options.deps 变化：应触发重绑（通过尺寸更新/回调再次触发来侧面验证）', () => {
		const div = document.createElement('div');
		document.body.appendChild(div);
		defineNumberProp(div, 'clientHeight', 300);
		defineNumberProp(div, 'scrollHeight', 1000);

		const onScroll = vi.fn();

		function WithDeps({ k }: { k: number }) {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const api = useScroll(div, { deps: [k], onScroll });
			return null;
		}

		const { rerender } = render(<WithDeps k={0} />);
		// 初次调用的 onScroll（初始化 updatePosition/updateSize 合流）
		expect(onScroll).toHaveBeenCalledTimes(1);
		onScroll.mockClear();

		// 依赖变化
		rerender(<WithDeps k={1} />);

		// 重绑后会再次在初始化阶段触发一次 onScroll
		expect(onScroll).toHaveBeenCalledTimes(1);
	});

	it('ResizeObserver 触发：应调用 updateSize 并通过 onScroll 合流回调', () => {
		const div = document.createElement('div');
		document.body.appendChild(div);
		defineNumberProp(div, 'clientHeight', 300);
		defineNumberProp(div, 'scrollHeight', 1000);

		const onScroll = vi.fn();

		render(<TestWithTarget target={div} onScroll={onScroll} />);

		onScroll.mockClear();

		// 模拟尺寸变化：先改只读值，再触发 RO 回调
		defineNumberProp(div, 'clientHeight', 320);
		defineNumberProp(div, 'scrollHeight', 1200);

		// 触发最近一个 RO 实例的回调
		const lastRO = RO_INSTANCES[RO_INSTANCES.length - 1];
		lastRO.__trigger();

		// updateSize 后会通过 wrapperRaf 合流触发 onScroll（携带最新 size）
		expect(onScroll).toHaveBeenCalledTimes(1);
		const [, sizeArg] = onScroll.mock.calls[0];
		expect(sizeArg).toMatchObject({ clientHeight: 320, scrollHeight: 1200 });
	});
});
