import { wrapperRaf as raf } from './raf';

/**
 * 判断传入对象是否为 `window` 对象。
 *
 * 此方法用于检测某个对象是否是 `window`，可用于区分 `HTMLElement`、`Document` 和 `Window`，
 * 在处理滚动事件、DOM 操作等场景时，确保代码不会误操作非 `window` 对象。
 *
 * @param obj 需要判断的对象
 * @returns 如果 `obj` 是 `window`，则返回 `true`，否则返回 `false`
 *
 * @example
 * ```ts
 * console.log(isWindow(window)); // true
 * console.log(isWindow(document)); // false
 * console.log(isWindow(null)); // false
 * console.log(isWindow({})); // false
 * ```
 */
export function isWindow(obj: any): obj is Window {
    return obj !== null && obj !== undefined && obj === obj.window;
}

/**
 * 获取目标元素的垂直滚动位置。
 *
 * 此方法用于获取 `window`、`document` 或 `HTMLElement` 的当前滚动位置（`scrollTop`）。
 * - **如果目标是 `window`**，则返回 `window.pageYOffset`（即 `scrollY`）。
 * - **如果目标是 `document`**，则返回 `document.documentElement.scrollTop`。
 * - **如果目标是 `HTMLElement`**，则返回 `target.scrollTop`。
 * - **如果目标为 `null` 或者类型不匹配**，返回 `0` 作为默认值。
 *
 * @param target 需要获取滚动位置的目标对象，可以是 `HTMLElement`、`Window` 或 `Document`
 * @returns `number` 目标的垂直滚动值，如果 `target` 为空或无效，则返回 `0`
 *
 * ---
 *
 * @example
 * **1️⃣ 获取 `window` 滚动位置**
 * ```ts
 * window.scrollTo(0, 200); // 滚动到 200px 位置
 * console.log(getScroll(window)); // 200
 * ```
 *
 * **2️⃣ 获取 `document` 滚动位置**
 * ```ts
 * document.documentElement.scrollTop = 300;
 * console.log(getScroll(document)); // 300
 * ```
 *
 * **3️⃣ 获取 `HTMLElement` 滚动位置**
 * ```ts
 * const div = document.createElement('div');
 * div.style.height = '1000px';
 * document.body.appendChild(div);
 * div.scrollTop = 150;
 * console.log(getScroll(div)); // 150
 * ```
 *
 * **4️⃣ 传入 `null`，返回默认值 `0`**
 * ```ts
 * console.log(getScroll(null)); // 0
 * ```
 */
export const getScroll = (target: HTMLElement | Window | Document | null): number => {
    if (typeof window === 'undefined') {
        return 0;
    }
    let result = 0;
    if (isWindow(target)) {
        result = target.pageYOffset;
    } else if (target instanceof Document) {
        result = target.documentElement.scrollTop;
    } else if (target instanceof HTMLElement) {
        result = target.scrollTop;
    } else if (target) {
        // According to the type inference, the `target` is `never` type.
        // Since we configured the loose mode type checking, and supports mocking the target with such shape below::
        //    `{ documentElement: { scrollLeft: 200, scrollTop: 400 } }`,
        //    the program may falls into this branch.
        // Check the corresponding tests for details. Don't sure what is the real scenario this happens.
        /* biome-ignore lint/complexity/useLiteralKeys: target is a never type */ /* eslint-disable-next-line dot-notation */
        result = target['scrollTop'];
    }

    if (target && !isWindow(target) && typeof result !== 'number') {
        result = (target.ownerDocument ?? target).documentElement?.scrollTop;
    }
    return result;
};

/**
 * **三次缓动函数（Ease-In-Out-Cubic）**
 *
 * 该函数用于平滑计算**动画过渡效果**，通常用于滚动、缓动动画等场景。
 * 它实现了一种**缓慢开始、加速、中间减速、平滑结束**的过渡效果，
 * 在动画过程中提供更自然的体验。
 *
 * **数学公式：**
 * - `easeInOutCubic` 采用三次贝塞尔曲线的方式计算动画进度：
 *   - 前半段 (`t < d/2`) 使用 `t³` 实现缓慢加速
 *   - 后半段 (`t >= d/2`) 使用 `(t-2)³ + 2` 实现缓慢减速
 *
 * ---
 *
 * **@param t** 当前时间（动画已进行的时间）
 * **@param b** 初始值（起始位置）
 * **@param c** 结束值（目标位置）
 * **@param d** 动画持续时间
 * **@returns** `number` 计算出的当前动画位置
 *
 * ---
 *
 * **示例**
 * ```ts
 * const start = 0; // 初始位置
 * const end = 100; // 目标位置
 * const duration = 500; // 动画时长 500ms
 *
 * const progress = easeInOutCubic(250, start, end, duration);
 * console.log(progress); // 计算当前过渡位置
 * ```
 */
export function easeInOutCubic(t: number, b: number, c: number, d: number) {
    const cc = c - b;
    // biome-ignore lint: it is a common easing function
    t /= d / 2;
    if (t < 1) {
        return (cc / 2) * t * t * t + b;
    }
    // biome-ignore lint: it is a common easing function
    return (cc / 2) * ((t -= 2) * t * t + 2) + b;
}

interface ScrollToOptions {
    /** Scroll container, default as window */
    getContainer?: () => HTMLElement | Window | Document;
    /** Scroll end callback */
    callback?: () => void;
    /** Animation duration, default as 450 */
    duration?: number;
}

/**
 * **平滑滚动至目标位置**
 *
 * 该方法实现**缓动滚动效果**，通过 `requestAnimationFrame` 在指定时间内
 * **平滑滚动**至目标位置，避免滚动跳跃导致的用户体验问题。
 *
 * ---
 *
 * **@param y** 目标滚动位置（像素值）
 * **@param options** 配置项，包含以下属性：
 *   - `getContainer` (`() => Window | HTMLElement | Document`) **获取滚动容器**（默认 `window`）
 *   - `callback` (`() => void`) **滚动结束后的回调函数**
 *   - `duration` (`number`) **滚动持续时间（默认 `450ms`）**
 *
 * ---
 *
 * **执行逻辑**
 * 1. 计算当前滚动位置 `scrollTop`
 * 2. 通过 `easeInOutCubic` 计算平滑过渡位置
 * 3. 使用 `requestAnimationFrame` 实现流畅滚动
 * 4. 滚动结束后执行 `callback` 回调（如果存在）
 *
 * ---
 *
 * **示例**
 * ```ts
 * // 滚动至 Y = 500 位置，持续 600ms
 * scrollTo(500, {
 *   duration: 600,
 *   callback: () => console.log("滚动完成"),
 * });
 * ```
 */
export function scrollTo(y: number, options: ScrollToOptions = {}) {
    const { getContainer = () => window, callback, duration = 450 } = options;
    const container = getContainer();
    const scrollTop = getScroll(container);
    const startTime = Date.now();

    const frameFunc = () => {
        const timestamp = Date.now();
        const time = timestamp - startTime;
        const nextScrollTop = easeInOutCubic(time > duration ? duration : time, scrollTop, y, duration);
        if (isWindow(container)) {
            (container as Window).scrollTo(window.pageXOffset, nextScrollTop);
        } else { // @ts-ignore
            if (container instanceof Document || container.constructor.name === 'HTMLDocument') {
                        (container as Document).documentElement.scrollTop = nextScrollTop;
                    } else {
                        (container as HTMLElement).scrollTop = nextScrollTop;
                    }
        }
        if (time < duration) {
            raf(frameFunc);
        } else if (typeof callback === 'function') {
            callback();
        }
    };
    raf(frameFunc);
}
