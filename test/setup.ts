import '@testing-library/jest-dom';

// 1) 确保 DOM 类型存在（tsconfig 里也要有 "dom" lib）
declare global {
	// Vitest 在 Node 里跑，需要给全局挂一些浏览器 API
	// 这里是最小 polyfill；按需补充
	// eslint-disable-next-line no-var
	var ResizeObserver: any;
}

// 2) ResizeObserver（JSDOM 默认没有）
if (typeof globalThis.ResizeObserver === 'undefined') {
	class RO {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
	// @ts-ignore
	globalThis.ResizeObserver = RO;
}

// 3) scrollX/scrollY/pageXOffset等（JSDOM 并不实现滚动）
try {
	Object.defineProperty(window, 'scrollX', { value: 0, writable: true });
	Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
	Object.defineProperty(window, 'pageXOffset', { value: 0, writable: true });
	Object.defineProperty(window, 'pageYOffset', { value: 0, writable: true });
} catch { /* 在部分 runner 已存在即可忽略 */ }

// 4) getComputedStyle（通常有，但这里兜底）
if (typeof window.getComputedStyle !== 'function') {
	// @ts-ignore
	window.getComputedStyle = () => ({});
}

// 5) DOMRect 兜底（旧 JSDOM 版本可能不全）
if (typeof (globalThis as any).DOMRect === 'undefined') {
	// 简化实现，满足 getBoundingClientRect 的返回类型
	(globalThis as any).DOMRect = class {
		x = 0; y = 0; width = 0; height = 0; top = 0; left = 0; bottom = 0; right = 0;
		toJSON() { return {}; }
	};
}
