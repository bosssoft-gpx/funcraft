import { useMemo, useCallback, useEffect, useRef } from 'react';
import { scrollTo, wrapperRaf } from '../../utils';
import { useStateRef } from '../useStateRef';
import { useEffectWithTarget } from './useEffectWithTarget';
import { getTargetElement, canAccessIFrame, getScrollTopForChild } from './utils';

import type { DependencyList } from 'react';
import type { ScrollToOptions } from '../../utils';
import type { ScrollListenController, Position, BasicTarget, DomSize, Target } from './typing';

export interface IUseScrollOptions extends Pick<ScrollToOptions, 'duration'> {
	/**
	 * 控制何时触发更新的控制器
	 *
	 * @default () => true
	 *
	 * @description 如果返回 true 则触发更新，返回 false 则不更新
	 *
	 * 可以用于节流或防抖
	 */
	shouldUpdate?: ScrollListenController;

	/**
	 * 滚动时触发的回调函数
	 *
	 * @param position 当前滚动位置
	 * @param size 当前元素的尺寸信息，如果无法获取则为 null
	 *
	 * @description 每次滚动时都会触发该回调函数，传入当前的滚动位置和元素尺寸信息
	 */
	onScroll?: (position: Position, size: DomSize | null) => void;

	/**
	 * 依赖项数组，当数组中的值发生变化时，重新绑定滚动事件
	 *
	 * @description 如果目标元素是动态变化的，或者你希望在某些状态变化时重新绑定滚动事件，可以使用该属性
	 */
	deps?: DependencyList;
}

export interface IScrollPosition {
	/**
	 * 当前滚动位置
	 */
	position: Position;

	/**
	 * 是否已经到达顶部
	 */
	isTop: boolean;

	/**
	 * 是否已经到达底部
	 */
	isBottom: boolean;

	/**
	 * 是否已经到达左侧
	 */
	isLeft: boolean;

	/**
	 * 是否已经到达右侧
	 */
	isRight: boolean;
}

export interface IUseScrollReturn extends IScrollPosition {
	/**
	 * 手动滚动到指定位置
	 *
	 * @todo 尚未实现水平滚动功能
	 *
	 * @param position 目标位置，可以只传入部分属性，未传入的属性保持不变，如果传入的是 Target，则滚动到该元素的顶部和左侧，该元素必须是当前滚动元素的子元素，否则无效（会抛出警告）
	 */
	scrollTo: (position: Partial<Position> | BasicTarget) => void;

	/**
	 * 快速滚动到顶部的方法
	 *
	 * @description 如果目标元素是 window 或 document，则滚动到页面顶部
	 * 如果是其他元素，则滚动到该元素的顶部
	 */
	scrollToTop: () => void;

	/**
	 * 快速滚动到底部的方法
	 *
	 * @description 如果目标元素是 window 或 document，则滚动到页面底部
	 * 如果是其他元素，则滚动到该元素的底部
	 */
	scrollToBottom: () => void;

	/**
	 * 快速滚动到左侧的方法
	 *
	 * @todo 尚未实现水平滚动功能
	 *
	 * @description 如果目标元素是 window 或 document，则滚动到页面左侧
	 * 如果是其他元素，则滚动到该元素的左侧
	 */
	scrollToLeft: () => void;

	/**
	 * 快速滚动到右侧的方法
	 *
	 * @todo 尚未实现水平滚动功能
	 *
	 * @description 如果目标元素是 window 或 document，则滚动到页面右侧
	 * 如果是其他元素，则滚动到该元素的右侧
	 */
	scrollToRight: () => void;
}

/**
 * 滚动位置误差值
 */
const EPS = 1;

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

/**
 * 响应式获取和控制滚动位置的 Hook
 *
 * @todo 尚未完成详细测试，请谨慎使用
 *
 * @param target 目标元素，可以是 HTMLElement、Window 或 Document，也可以是 Ref 对象或返回这些对象的函数
 * @param options 配置项，包含以下属性：
 *   - `duration` (`number`) **滚动动画持续时间（默认 `450ms`）**
 *   - `shouldUpdate` (`(params: { left: number; top: number }) => boolean`) **控制何时触发更新的控制器（默认每次滚动都触发更新）可以用于节流或防抖**
 *
 * @description 该 Hook 用于监听指定元素的滚动位置，并提供多种方法来控制滚动行为。它返回当前的滚动位置和边界状态，以及用于滚动到指定位置或边界的方法。
 *
 * @returns 返回一个对象，包含以下属性和方法：
 *  - `position` (`{ left: number; top: number }`) 当前滚动位置
 *  - `isTop` (`boolean`) 是否已经到达顶部
 *  - `isBottom` (`boolean`) 是否已经到达底部
 *  - `isLeft` (`boolean`) 是否已经到达左侧
 *  - `isRight` (`boolean`) 是否已经到达右侧
 *  - `scrollTo(position: Partial<{ left: number; top: number }> | Target)` 手动滚动到指定位置
 *  - `scrollToTop()` 快速滚动到顶部
 *  - `scrollToBottom()` 快速滚动到底部
 *  - `scrollToLeft()` 快速滚动到左侧
 *  - `scrollToRight()` 快速滚动到右侧
 *
 * @example
 * ```tsx
 * import React, { useRef } from 'react';
 * import { useScroll } from '@gpx/common-funcraft';
 *
 * const ScrollComponent: React.FC = () => {
 *   const scrollRef = useRef<HTMLDivElement>(null);
 *   const { position, isTop, isBottom, scrollToTop, scrollToBottom } = useScroll(scrollRef, { duration: 300 });
 *
 *   return (
 *     <div>
 *       <div ref={scrollRef} style={{ height: '200px', overflow: 'auto' }}>
 *         <div style={{ height: '1000px' }}>
 *           Scrollable Content
 *         </div>
 *       </div>
 *       <div>
 *         <p>Current Position: {`Top: ${position.top}, Left: ${position.left}`}</p>
 *         <p>Is Top: {isTop ? 'Yes' : 'No'}</p>
 *         <p>Is Bottom: {isBottom ? 'Yes' : 'No'}</p>
 *         <button onClick={scrollToTop}>Scroll to Top</button>
 *         <button onClick={scrollToBottom}>Scroll to Bottom</button>
 *       </div>
 *     </div>
 *   );
 * };
 * export default ScrollComponent;
 * ```
 */
export const useScroll = (target: Target, options?: IUseScrollOptions): IUseScrollReturn => {
	if (!isBrowser) {
		// 如果不是浏览器环境，返回空实现
		return {
			position: { left: 0, top: 0 },
			isTop: true,
			isBottom: true,
			isLeft: true,
			isRight: true,
			scrollTo: () => {},
			scrollToTop: () => {},
			scrollToBottom: () => {},
			scrollToLeft: () => {},
			scrollToRight: () => {},
		};
	}

	const [position, setPosition, positionRef] = useStateRef<Position>({ left: 0, top: 0 });
	const [size, setSize, sizeRef] = useStateRef<DomSize | null>(null);

	const shouldUpdateRef = useRef<ScrollListenController>(options?.shouldUpdate || (() => true));
	const onScrollRef = useRef(options?.onScroll);
	const durationRef = useRef(options?.duration ?? 450);

	const isTop = useMemo(() => !!size && position.top - EPS <= 0, [position.top, size]);
	const isBottom = useMemo(() => !!size && position.top + size.clientHeight >= size.scrollHeight - EPS, [position.top, size]);
	const isLeft = useMemo(() => !!size && position.left - EPS <= 0, [position.left, size]);
	const isRight = useMemo(() => !!size && position.left + size.clientWidth >= size.scrollWidth - EPS, [position.left, size]);

	const handleOnScroll = useCallback((newPosition: Position, newSize: DomSize | null) => {
		if (typeof onScrollRef.current === 'function') {
			onScrollRef.current(newPosition, newSize);
		}
	} , []);

	const handleScrollTo = useCallback((targetPosition: Partial<Position> | BasicTarget) => {
		if (!targetPosition) {
			console.warn('[useScroll]: scrollTo 方法需要传入目标位置或元素 - ', targetPosition);
			return;
		}

		if (typeof targetPosition === 'object' && ('left' in targetPosition || 'top' in targetPosition)) {

			if (typeof targetPosition.left === 'number') {
				console.warn('[useScroll]: 当前尚未实现水平滚动，left 将被忽略：', targetPosition.left);
			}

			const left = targetPosition.left ?? positionRef.current!.left;
			const top = targetPosition.top ?? positionRef.current!.top;
			const el = getTargetElement(target);
			if (!el) {
				console.warn('[useScroll]: 未能获取到目标元素 - ', target);
				return;
			}
			scrollTo(top, {
				getContainer: () => el as HTMLElement | Window | Document,
				duration: durationRef.current
			});
			return;
		}

		const targetElement = getTargetElement(targetPosition as BasicTarget);
		if (!targetElement) {
			console.warn('[useScroll]: 未能获取到目标元素 - ', targetPosition);
			return;
		}
		const el = getTargetElement(target);
		if (!el) {
			console.warn('[useScroll]: 未能获取到目标元素 - ', target);
			return;
		}
		if (el === document || el === window) {
			if (targetElement instanceof HTMLElement) {
				const offsetTop = getScrollTopForChild(document, targetElement);
				scrollTo(offsetTop, { duration: durationRef.current });
			} else {
				console.warn('[useScroll]: 目标元素必须是 HTMLElement - ', targetElement);
			}
		} else {
			if (targetElement instanceof HTMLElement) {
				if ((el as HTMLElement).contains(targetElement)) {
					const offsetTop = getScrollTopForChild(el as HTMLElement, targetElement);
					// @todo 暂时不支持水平滚动
					// const offsetLeft = targetElement.offsetLeft + (parent ? parent.offsetLeft : 0);
					scrollTo(offsetTop, {
						getContainer: () => el as HTMLElement,
						duration: durationRef.current
					});
				} else {
					console.warn('[useScroll]: 目标元素必须是当前滚动元素的子元素 - ', targetElement);
				}
			} else {
				console.warn('[useScroll]: 目标元素必须是 HTMLElement - ', targetElement);
			}
		}
	}, [target]);

	const handleScrollToTop = useCallback(() => {
		const el = getTargetElement(target);
		if (!el) {
			console.warn('[useScroll]: 未能获取到目标元素 - ', target);
			return;
		}
		if (el === document || el === window) {
			scrollTo(0, { duration: durationRef.current });
		} else {
			scrollTo(0, {
				getContainer: () => el as HTMLElement,
				duration: durationRef.current
			});
		}
	}, [target]);

	const handleScrollToBottom = useCallback(() => {
		const el = getTargetElement(target);
		if (!el) {
			console.warn('[useScroll]: 未能获取到目标元素 - ', target);
			return;
		}
		if (el === document || el === window) {
			// 这里不能使用 sizeRef.current.scrollHeight，因为可能获取不到 size 信息
			// 只能通过 document.documentElement.scrollHeight 来获取整个页面的高度
			const root = document.scrollingElement || document.documentElement;
			scrollTo(root.scrollHeight, { duration: durationRef.current });
		} else {
			if (sizeRef.current) {
				scrollTo(sizeRef.current.scrollHeight, {
					getContainer: () => el as HTMLElement,
					duration: durationRef.current
				});
			} else {
				console.warn('[useScroll]: 未能获取到目标元素的尺寸信息，无法滚动到底部 - ', el);
			}
		}
	}, [target]);

	/**
	 * @todo 尚未实现水平滚动功能
	 */
	const handleScrollToLeft = useCallback(() => {
		console.warn('[useScroll]: scrollToLeft 方法尚未实现水平滚动功能');
	}, [target]);

	/**
	 * @todo 尚未实现水平滚动功能
	 */
	const handleScrollToRight = useCallback(() => {
		console.warn('[useScroll]: scrollToRight 方法尚未实现水平滚动功能');
	}, [target]);

	const getTargetWindowCurrentPosition = useCallback((targetWindow: Window) => {
		const targetDocument = targetWindow.document;
		if (targetDocument.scrollingElement) {
			return {
				left: targetDocument.scrollingElement.scrollLeft,
				top: targetDocument.scrollingElement.scrollTop
			};
		} else {
			// When in quirks mode, the scrollingElement attribute returns the HTML body element if it exists and is potentially scrollable, otherwise it returns null.
			// https://developer.mozilla.org/zh-CN/docs/Web/API/Document/scrollingElement
			// https://stackoverflow.com/questions/28633221/document-body-scrolltop-firefox-returns-0-only-js
			return {
				left: Math.max(
					targetWindow.pageXOffset,
					targetDocument.documentElement.scrollLeft,
					targetDocument.body.scrollLeft,
				),
				top: Math.max(
					targetWindow.pageYOffset,
					targetDocument.documentElement.scrollTop,
					targetDocument.body.scrollTop,
				),
			};
		}
	}, []);

	const getTargetWindowSize = useCallback((targetWindow: Window): DomSize => {
		const targetDocument = targetWindow.document;
		if (targetDocument.scrollingElement) {
			return {
				clientWidth: targetDocument.scrollingElement.clientWidth,
				clientHeight: targetDocument.scrollingElement.clientHeight,
				scrollWidth: targetDocument.scrollingElement.scrollWidth,
				scrollHeight: targetDocument.scrollingElement.scrollHeight,
			};
		} else {
			const body = targetDocument.body;
			const html = targetDocument.documentElement;
			return {
				clientWidth: Math.max(body.clientWidth, html.clientWidth),
				clientHeight: Math.max(body.clientHeight, html.clientHeight),
				scrollWidth: Math.max(body.scrollWidth, html.scrollWidth),
				scrollHeight: Math.max(body.scrollHeight, html.scrollHeight),
			};
		}
	}, []);

	const readElementPos = useCallback((element: Element | Document | Window) => {
		if (element === window || element === document) return getTargetWindowCurrentPosition(window);
		if (element instanceof HTMLIFrameElement) {
			if (canAccessIFrame(element)) return getTargetWindowCurrentPosition(element.contentWindow!);
			console.warn('useScroll: 无法访问 iframe 内部的滚动位置,请确保 iframe 与当前页面同源 - ', element);
			return positionRef.current!;
		}
		return {
			left: (element as Element).scrollLeft,
			top: (element as Element).scrollTop,
		};
	}, [getTargetWindowCurrentPosition]);

	const readElementSize = useCallback((element: Element | Document | Window) => {
		if (element === window || element === document) return getTargetWindowSize(window);
		if (element instanceof HTMLIFrameElement) {
			if (canAccessIFrame(element)) return getTargetWindowSize(element.contentWindow!);
			console.warn('useScroll: 无法访问 iframe 内部的尺寸信息,请确保 iframe 与当前页面同源 - ', element);
			return sizeRef.current;
		}
		const targetEl = element as HTMLElement;
		return {
			clientWidth: targetEl.clientWidth,
			clientHeight: targetEl.clientHeight,
			scrollWidth: targetEl.scrollWidth,
			scrollHeight: targetEl.scrollHeight,
		};
	}, [getTargetWindowSize]);

	useEffect(() => {
		shouldUpdateRef.current = options?.shouldUpdate || (() => true);
	}, [options?.shouldUpdate]);

	useEffect(() => {
		onScrollRef.current = options?.onScroll;
	}, [options?.onScroll]);

	useEffect(() => {
		durationRef.current = options?.duration ?? 450;
	}, [options?.duration]);

	useEffectWithTarget(() => {
		const el = getTargetElement(target);
		if (!el) return;

		let scrollEvtTarget: EventTarget | null = null;
		let resizeEvtTarget: EventTarget | null = null;
		let ro: ResizeObserver | null = null;

		const updatePosition = () => {
			const newPosition = readElementPos(el);
			if (shouldUpdateRef.current(newPosition)) {
				setPosition(newPosition);
			}
			wrapperRaf(() => handleOnScroll(newPosition, sizeRef.current));
		};

		const updateSize = () => {
			const newSize = readElementSize(el);
			setSize(newSize);
			wrapperRaf(() => handleOnScroll(positionRef.current!, newSize));
		};

		if (el === window || el === document) {
			scrollEvtTarget = window;
			resizeEvtTarget = window;
		} else if (el instanceof HTMLIFrameElement) {
			if (!canAccessIFrame(el)) {
				console.warn('useScroll: 无法访问 iframe 内部的滚动位置,请确保 iframe 与当前页面同源 - ', el);
				return;
			}
			scrollEvtTarget = el.contentWindow;
			resizeEvtTarget = el.contentWindow;
		} else {
			const node = el as HTMLElement;
			scrollEvtTarget = node;

			/**
			 * 监听元素尺寸变化的方式有三种：
			 * 1. ResizeObserver (现代浏览器)
			 * 2. window resize 事件 (当作降级方案)
			 * 3. MutationObserver (当作降级方案)
			 */
			if (typeof ResizeObserver !== 'undefined') {
				ro = new ResizeObserver(() => updateSize());
				ro.observe(node);
			} else {
				resizeEvtTarget = window;
			}
		}

		updatePosition();
		updateSize();

		scrollEvtTarget?.addEventListener('scroll', updatePosition, { passive: true });
		resizeEvtTarget?.addEventListener('resize', updateSize);

		// iframe: 监听 load，确保内容载入或内部导航后刷新一次
		let onIFrameLoad: ((this: HTMLIFrameElement, ev: Event) => any) | undefined;
		if (el instanceof HTMLIFrameElement && canAccessIFrame(el)) {
			onIFrameLoad = () => { updateSize(); updatePosition(); };
			el.addEventListener('load', onIFrameLoad);
		}

		return () => {
			scrollEvtTarget?.removeEventListener('scroll', updatePosition);
			resizeEvtTarget?.removeEventListener('resize', updateSize);
			ro?.disconnect();
			if (onIFrameLoad) el.removeEventListener('load', onIFrameLoad);
		};
	}, options?.deps || [], target);

	return {
		position,
		isTop,
		isBottom,
		isLeft,
		isRight,
		scrollTo: handleScrollTo,
		scrollToTop: handleScrollToTop,
		scrollToBottom: handleScrollToBottom,
		scrollToLeft: handleScrollToLeft,
		scrollToRight: handleScrollToRight,
	};
};

export type * from './typing';
export * from './utils';
export * from './useEffectWithTarget';