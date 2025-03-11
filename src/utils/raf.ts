let raf = (callback: FrameRequestCallback) => +setTimeout(callback, 16);
let caf = (num: number) => clearTimeout(num);

if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
    raf = (callback: FrameRequestCallback) =>
        window.requestAnimationFrame(callback);
    caf = (handle: number) => window.cancelAnimationFrame(handle);
}

let rafUUID = 0;

// @ts-ignore
const rafIds = new Map<number, number>();

function cleanup(id: number) {
    rafIds.delete(id);
}

/**
 * **封装的 `requestAnimationFrame` 调度方法**
 *
 * `wrapperRaf` 兼容 `requestAnimationFrame` 和 `setTimeout(16ms)`，用于在浏览器环境中更高效地执行异步任务（如动画、状态更新、节流等）。
 *
 * ### 作用
 * 1. **优化性能** - `requestAnimationFrame` 允许浏览器同步 UI 更新，避免不必要的重绘，提高渲染效率。
 * 2. **防止 UI 卡顿** - 适用于高频操作，如**动画更新、滚动监听、窗口 resize 事件**等。
 * 3. **兼容性保障** - 在 **Node.js 或不支持 `requestAnimationFrame` 的环境** 下，自动回退到 `setTimeout(16ms)`。
 * 4. **递归调度** - 允许 **多次连续调用 `requestAnimationFrame`**，模拟平滑动画帧或延迟执行逻辑。
 * 5. **提供取消方法** - 可以随时调用 `wrapperRaf.cancel(id)` 取消未执行的任务。
 *
 * ### 参数
 * @param callback 需要执行的回调函数
 * @param times (可选) **递归执行的次数**，默认 `1`（即仅执行一次）。
 *
 * @returns `number` 任务 ID，可用于 `wrapperRaf.cancel(id)` 取消任务
 *
 * ---
 *
 * ### 使用示例
 *
 * **1️⃣ 使用 `wrapperRaf` 触发单次 `requestAnimationFrame`**
 * ```ts
 * import wrapperRaf from "@gpx/common-utils";
 *
 * wrapperRaf(() => {
 *   console.log("下一帧执行逻辑");
 * });
 * ```
 * **等价于**
 * ```ts
 * requestAnimationFrame(() => console.log("下一帧执行逻辑"));
 * ```
 *
 * ---
 *
 * **2️⃣ 触发 3 次 `requestAnimationFrame`，模拟动画帧**
 * ```ts
 * wrapperRaf(() => {
 *   console.log("动画帧触发");
 * }, 3);
 * ```
 * **执行流程**
 * - **第 1 帧**：注册 `requestAnimationFrame`（倒计时 `3`）
 * - **第 2 帧**：执行 `requestAnimationFrame`（倒计时 `2`）
 * - **第 3 帧**：执行 `requestAnimationFrame`（倒计时 `1`），触发 `callback()`
 *
 * ---
 *
 * **3️⃣ 在 `requestAnimationFrame` 触发前取消任务**
 * ```ts
 * const id = wrapperRaf(() => console.log("不会执行"), 3);
 *
 * wrapperRaf.cancel(id); // 取消该任务
 * ```
 *
 * ---
 *
 * **4️⃣ 在开发模式下获取当前所有 `raf` 任务 ID**
 * ```ts
 * if (process.env.NODE_ENV !== "production") {
 *   console.log(wrapperRaf.ids()); // 获取当前所有的任务 ID
 * }
 * ```
 */
const wrapperRaf = (callback: () => void, times = 1): number => {
    rafUUID += 1;
    const id = rafUUID;

    function callRef(leftTimes: number) {
        if (leftTimes === 0) {
            // Clean up
            cleanup(id);

            // Trigger
            callback();
        } else {
            // Next raf
            const realId = raf(() => {
                callRef(leftTimes - 1);
            });

            // Bind real raf id
            rafIds.set(id, realId);
        }
    }

    callRef(times);

    return id;
};

/**
 * **取消 `wrapperRaf` 任务**
 *
 * @param id `wrapperRaf` 任务 ID
 * @returns `void`
 *
 * ---
 *
 * **示例**
 * ```ts
 * const id = wrapperRaf(() => console.log("不会执行"), 3);
 * wrapperRaf.cancel(id); // 取消该任务
 * ```
 */
wrapperRaf.cancel = (id: number) => {
    const realId = rafIds.get(id) as number;
    cleanup(id);
    return caf(realId);
};

// @ts-ignore
if (process.env.NODE_ENV !== 'production') {
    /**
     * **（仅开发模式）获取当前所有 `raf` 任务的映射 ID**
     *
     * @returns `Map<number, number>` 当前所有 `raf` 任务的 ID 映射
     *
     * ---
     *
     * **示例**
     * ```ts
     * if (process.env.NODE_ENV !== "production") {
     *   console.log(wrapperRaf.ids()); // 获取当前所有的任务 ID
     * }
     * ```
     */
    wrapperRaf.ids = () => rafIds;
}

export { wrapperRaf };