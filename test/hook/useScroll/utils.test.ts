import { describe, it, vi, beforeEach, afterEach } from 'vitest';
import { canAccessIFrame, getTargetElement, depsAreSame, getScrollTopForChild } from 'src';

import type { BasicTarget } from 'src';

describe('canAccessIFrame', () => {
	it('同源 iframe：可正常访问，返回 true', () => {
		// 构造一个“同源”的 iframe 替身
		const sameOriginIFrame = {
			contentWindow: {
				document: { domain: 'example.com' },
			},
		} as unknown as HTMLIFrameElement;

		expect(canAccessIFrame(sameOriginIFrame)).toBe(true);
	});

	it('跨域 iframe：访问 document.domain 抛错，返回 false（仅警告，不抛出）', () => {
		// 用 getter 模拟跨域访问抛错的行为
		const doc = {};
		Object.defineProperty(doc, 'domain', {
			get() {
				throw new DOMException('Blocked by same-origin policy');
			},
		});

		const crossOriginIFrame = {
			contentWindow: { document: doc },
		} as unknown as HTMLIFrameElement;

		expect(canAccessIFrame(crossOriginIFrame)).toBe(false);
	});
});

describe('getTargetElement', () => {
	type Ref<T> = { current: T | null };

	it('target 为 Element：直接返回该元素', () => {
		const el = document.createElement('div');
		const res = getTargetElement(el);
		expect(res).toBe(el);
	});

	it('target 为函数：返回函数返回的元素', () => {
		const el = document.createElement('div');
		const target = () => el;
		const res = getTargetElement(target);
		expect(res).toBe(el);
	});

	it('target 为 ref 且 current 指向元素：返回 ref.current', () => {
		const el = document.createElement('div');
		const ref: Ref<HTMLDivElement> = { current: el };
		const res = getTargetElement(ref as unknown as BasicTarget<HTMLDivElement>);
		expect(res).toBe(el);
	});

	it('target 为 null/undefined：返回 defaultElement', () => {
		const fallback = document.body;
		const res1 = getTargetElement(null, fallback);
		const res2 = getTargetElement(undefined, fallback);
		expect(res1).toBe(fallback);
		expect(res2).toBe(fallback);
	});

	it('ref.current 为空：返回 defaultElement', () => {
		const ref: Ref<HTMLDivElement> = { current: null };
		const fallback = document.body;
		const res = getTargetElement(ref as unknown as BasicTarget<HTMLDivElement>, fallback);
		expect(res).toBe(fallback);
	});

	it('函数返回 null：返回 defaultElement', () => {
		const fallback = document.body;
		const target = () => null;
		const res = getTargetElement(target, fallback);
		expect(res).toBe(fallback);
	});
});

describe('depsAreSame', () => {
	it('同一引用的依赖数组：返回 true', () => {
		const arr = [1, 'a', true];
		expect(depsAreSame(arr, arr)).toBe(true);
	});

	it('不同引用但原始值相同：返回 true', () => {
		const a = [1, 'a', true];
		const b = [1, 'a', true];
		expect(depsAreSame(a, b)).toBe(true);
	});

	it('值不同：返回 false', () => {
		const a = [1, 'a', true];
		const b = [2, 'a', true];
		expect(depsAreSame(a, b)).toBe(false);
	});

	it('长度不同：返回 false', () => {
		const a = [1, 2];
		const b = [1, 2, 3];
		expect(depsAreSame(a, b)).toBe(false);
	});

	it('包含 NaN：当前实现返回 false（记录该行为）', () => {
		const a = [NaN];
		const b = [NaN];
		// 由于实现使用 !== 比较，NaN !== NaN → true，因此这里会返回 false
		expect(depsAreSame(a, b)).toBe(false);
	});

	it('对象引用不同（即使内容相同）也会返回 false（符合浅比较语义）', () => {
		const a = [{ x: 1 }];
		const b = [{ x: 1 }];
		expect(depsAreSame(a, b)).toBe(false);
	});
});

describe('getScrollTopForChild', () => {
	const originalPageYOffset = Object.getOwnPropertyDescriptor(window, 'pageYOffset');

	beforeEach(() => {
		vi.restoreAllMocks();
	});

	afterEach(() => {
		// 还原 pageYOffset
		if (originalPageYOffset) {
			Object.defineProperty(window, 'pageYOffset', originalPageYOffset);
		} else {
			// 清掉我们加的可配置属性
			// @ts-ignore
			delete (window as any).pageYOffset;
		}
	});

	it('容器为 window/document：返回 child.getBoundingClientRect().top + window.pageYOffset/scrollY', () => {
		const child = document.createElement('div');

		// 模拟 child 的布局
		vi.spyOn(child, 'getBoundingClientRect').mockReturnValue({
			top: 500, left: 0, bottom: 0, right: 0, width: 0, height: 0, x: 0, y: 0,
			toJSON() { return {}; },
		} as DOMRect);

		// 用 pageYOffset 兜底（jsdom 下 scrollY 往往不可写）
		Object.defineProperty(window, 'pageYOffset', { value: 200, configurable: true });

		const res1 = getScrollTopForChild(window, child);
		const res2 = getScrollTopForChild(document, child);

		expect(res1).toBe(700);
		expect(res2).toBe(700);
	});

	it('容器为元素：返回 child.top - container.top + container.scrollTop', () => {
		const container = document.createElement('div');
		const child = document.createElement('div');
		container.appendChild(child);

		// 模拟容器/子元素布局
		vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
			top: 100, left: 0, bottom: 0, right: 0, width: 0, height: 0, x: 0, y: 0,
			toJSON() { return {}; },
		} as DOMRect);

		vi.spyOn(child, 'getBoundingClientRect').mockReturnValue({
			top: 350, left: 0, bottom: 0, right: 0, width: 0, height: 0, x: 0, y: 0,
			toJSON() { return {}; },
		} as DOMRect);

		// @ts-ignore: jsdom 下可直接写入 scrollTop
		container.scrollTop = 30;

		const res = getScrollTopForChild(container, child);
		// 350 - 100 + 30 = 280
		expect(res).toBe(280);
	});
});
