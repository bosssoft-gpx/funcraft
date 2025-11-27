# 📌 React Hook 使用指南

此文档介绍了 `@gpx/common-funcraft` 工具库中提供的实用 **React Hook**，帮助开发者更方便地进行状态管理，解决常见的 React
开发问题。

---

## 🔹 `useStateRef`

`useStateRef` 是一个结合了 `useState` 和 `useRef` 的自定义
Hook，能在避免函数重新创建的同时获取到最新的状态值。尤其适合在使用 `useCallback` 等场景中需要访问最新状态但又不想触发频繁重渲染的情况。

### 🌟 主要作用

- ✅ **状态管理**：功能类似 React 官方的 `useState`，提供响应式状态更新；
- 🔥 **避免重渲染**：在不触发组件重渲染的情况下，通过 `ref` 获取最新的状态值；
- 🎯 **解决闭包陷阱**：尤其适合在 `useCallback` 或 `useEffect` 等依赖问题明显的场景。

---

### 📦 API

```typescript
declare const useStateRef: <S>(initialState: S) => [S, Dispatch<SetStateAction<S>>, RefObject<S>];
```

### 📖 参数说明

| 参数           | 类型    | 说明            |
|--------------|-------|---------------|
| initialState | `any` | 状态的初始值，可为任意类型 |

### 📦 返回值说明

| 返回值      | 类型                            | 说明             |
|----------|-------------------------------|----------------|
| `[0]`    | 状态 `S`                        | 当前状态值          |
| setState | `Dispatch<SetStateAction<S>>` | 更新状态的函数        |
| stateRef | `RefObject<S>`                | 保存当前状态值的 `ref` |

### ✨ 使用示例

#### 🌰 示例代码

```tsx
import React from 'react';
import { useStateRef } from '@gpx/common-funcraft';

function Counter() {
    // 使用 useStateRef hook 管理状态
    const [count, setCount, countRef] = useStateRef(0);

    // 使用 useCallback 时，不直接依赖状态，而是使用 ref 获取最新值，避免回调频繁重建
    const handleLogCount = React.useCallback(() => {
        console.log('当前 count 值:', countRef.current);
    }, [countRef]);

    return (
        <div>
            <p>当前计数: {count}</p>
            <button onClick={() => setCount(prev => prev + 1)}>增加</button>
            <button onClick={handleClick}>打印当前 count 值</button>
        </div>
    );
}

export default Counter;
```

#### 🌟 场景说明

上述示例中：

- 状态值 `count` 的更新使用了响应式的方式；
- `countRef` 用于始终访问最新状态，而不引起回调函数重新创建；
- `useCallback` 中直接使用 `countRef.current` 获取状态最新值，避免了过多的依赖更新。

#### 🚧 注意事项

- 本 Hook 依赖于 React 16.9 及以上版本。
- 请避免直接修改 ref 的值，状态更新请使用 `setState` 方法。

---

## 🔹 `useEffectWithTarget`

`useEffectWithTarget` 是一个将副作用 **绑定到特定目标元素**（或多个目标）的 Hook。它的行为与 `useEffect` 类似，但会在 **依赖变化** 或 **目标元素变化** 时执行清理并重新执行 effect，非常适合对 DOM 事件进行挂载/解绑、对动态容器做监听。

### 🌟 主要作用

- ✅ **目标绑定**：把副作用绑定到 `Element / Document / Window` 等目标；
- 🔄 **自动重绑**：当依赖或目标引用变化时，自动清理并重新执行；
- 🧩 **支持多个目标**：可同时对多个元素做副作用处理；
- 🧯 **健壮性**：避免遗漏清理导致的重复绑定与内存泄漏。

------

### 📦 API

```ts
declare const useEffectWithTarget: (
  effect: EffectCallback,
  deps: DependencyList,
  target: BasicTarget<any> | BasicTarget<any>[]
) => void;
```

> `BasicTarget<T>` 允许三种形式：
>
> - 直接的目标：`Element | Document | Window`
> - `RefObject<T | null>`
> - 返回上述对象的函数：`() => T | null | undefined`

------

### 📖 参数说明

| 参数   | 类型                          | 说明                             |
| ------ | ----------------------------- | -------------------------------- |
| effect | `EffectCallback`              | 副作用函数，返回清理函数（可选） |
| deps   | `DependencyList`              | 依赖项数组，变化时会触发重绑     |
| target | `BasicTarget | BasicTarget[]` | 目标元素/对象，支持单个或多个    |

------

### ✨ 使用示例

#### 🌰 监听滚动（单目标）

```tsx
import React, { useRef } from 'react';
import { useEffectWithTarget } from '@gpx/common-funcraft';

export default function Example() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffectWithTarget(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      // 处理滚动
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [], scrollRef);

  return <div ref={scrollRef} style={{ height: 200, overflow: 'auto' }} />;
}
```

#### 🌰 同时监听多个目标

```tsx
useEffectWithTarget(() => {
  const onResize = () => { /* ... */ };
  const onScroll = () => { /* ... */ };

  window.addEventListener('resize', onResize);
  document.addEventListener('scroll', onScroll, { passive: true });

  return () => {
    window.removeEventListener('resize', onResize);
    document.removeEventListener('scroll', onScroll);
  };
}, [], [window, document]);
```

------

### 💡 场景说明 & 小贴士

- `ref.current` 改变**也会**触发重新执行（因为 hook 内部实际上每一次 `rerender` 都会比较 `ref.current` 的变化）；
- 适合对动态容器做事件监听、尺寸监听等副作用操作；
- 对滚动事件请加 `{ passive: true }`，避免主线程阻塞。
- 清理函数在 **依赖变化** 与 **组件卸载** 时都会执行，确保事件不会重复挂载。

------

## 🚧 `useScroll`（实验性）

`useScroll` 用于**监听**指定容器的滚动位置，并提供**控制滚动**的一组方法。支持 `Element / Document / Window`，以及**同源** `iframe`（跨域将打印告警并跳过绑定）。

> ⚠️ 实验性说明：当前实现“可用但仍在打磨”。在某些场景（如初始化阶段）可能出现**一帧内多次回调**的情况；横向滚动 API 尚未实现，仅会打印告警。

### 🌟 主要作用

- 🧭 **获取滚动状态**：`position`、`isTop/isBottom/isLeft/isRight`；
- 🧰 **控制滚动**：`scrollTo / scrollToTop / scrollToBottom / ...`；
- 🧬 **回调通知**：`onScroll(position, size)` 获取最新位置与容器尺寸；
- 🧩 **多类目标**：Window / Document / 普通元素 / 同源 iframe。

------

### 📦 API

```ts
export interface IUseScrollOptions extends Pick<ScrollToOptions, 'duration'> {
  shouldUpdate?: (pos: { left: number; top: number }) => boolean;
  onScroll?: (position: Position, size: DomSize | null) => void;
  deps?: DependencyList; // 目标可能替换时传入，用于触发重绑
}

export interface IUseScrollReturn {
  position: { left: number; top: number };
  isTop: boolean;
  isBottom: boolean;
  isLeft: boolean;
  isRight: boolean;

  scrollTo: (position: Partial<Position> | BasicTarget) => void;
  scrollToTop: () => void;
  scrollToBottom: () => void;

  // 实验期：尚未实现
  scrollToLeft: () => void;   // 将打印告警
  scrollToRight: () => void;  // 将打印告警
}

declare const useScroll: (target: BasicTarget<Element | Document | Window>, options?: IUseScrollOptions) => IUseScrollReturn;
```

------

### 📖 参数说明

| 参数                 | 类型                                       | 说明                                         |
| -------------------- | ------------------------------------------ | -------------------------------------------- |
| target               | `BasicTarget<Element | Document | Window>` | 目标容器；也可传 `ref` 或返回目标的函数      |
| options.duration     | `number`                                   | 滚动动画时长（ms），默认 `450`               |
| options.shouldUpdate | `(pos) => boolean`                         | 返回 `false` 可阻止本次更新（可做阈值/节流） |
| options.onScroll     | `(position, size) => void`                 | 滚动/尺寸变更时回调（当前实现可能一帧多次）  |
| options.deps         | `DependencyList`                           | 目标会替换时传入标识触发重绑                 |

------

### 📦 返回值说明

| 字段             | 类型            | 说明                                                  |
| ---------------- | --------------- | ----------------------------------------------------- |
| position         | `{ left; top }` | 当前滚动位置                                          |
| isTop / isBottom | `boolean`       | 垂直边界（含 1px 容差）                               |
| isLeft / isRight | `boolean`       | 水平边界（含 1px 容差）                               |
| scrollTo*        | `function`      | 控制滚动的方法；`scrollTo` 也可传子元素，自动计算偏移 |

------

### ✨ 使用示例

#### 🌰 监听元素并滚动控制

```tsx
import React, { useRef } from 'react';
import { useScroll } from '@gpx/common-funcraft';

export default function List() {
  const listRef = useRef<HTMLDivElement>(null);

  const { position, isBottom, scrollToTop, scrollToBottom, scrollTo } = useScroll(listRef, 	 {
    duration: 300,
    onScroll: (pos, size) => {
      // 每次滚动或尺寸变化都会回调（实验期：初始化可能回调多次）
      // console.log(pos, size);
    },
    // 仅当垂直位移变化 >= 2px 时才更新
    shouldUpdate: (p) => Math.abs(p.top - (position.top ?? 0)) >= 2,
  });

  return (
    <>
      <div ref={listRef} style={{ height: 240, overflow: 'auto' }}>
        {/* ... 很长的内容 ... */}
      </div>

      <button onClick={scrollToTop}>回到顶部</button>
      <button onClick={scrollToBottom} disabled={isBottom}>滚动到底</button>
      {/* 滚到某个子元素（必须是当前容器的后代） */}
      <button onClick={() => scrollTo(() => document.getElementById('row-50'))}>
        滚到第 50 行
      </button>
    </>
  );
}
```

#### 🌰 监听页面（Window/Document）

```tsx
function Page() {
  const { position, isTop, scrollToTop, scrollToBottom, scrollTo } = useScroll(document, {
    onScroll: (pos) => { /* ... */ },
  });

  return (
    <>
      <p>Y: {position.top}</p>
      <button disabled={isTop} onClick={scrollToTop}>回到页面顶部</button>
      <button onClick={scrollToBottom}>滚到页面底部</button>
      <button onClick={() => scrollTo(() => document.getElementById('section-3')!)}>
        滚到 Section 3
      </button>
    </>
  );
}
```

#### 🌰 目标可能替换：用 `deps` 触发重绑

```tsx
const [activeTab, setActiveTab] = useState<'A' | 'B'>('A');
const aRef = useRef<HTMLDivElement>(null);
const bRef = useRef<HTMLDivElement>(null);

// activeTab 变化导致滚动容器变化，借助 deps 触发重绑
useScroll(() => (activeTab === 'A' ? aRef.current : bRef.current), {
  deps: [activeTab],
  onScroll: (pos) => { /* ... */ },
});
```

### ⚠️ 注意事项（实验性特性）

- **同源 `iframe`**：可正常监听 `contentWindow`；**跨域**将打印告警并跳过绑定。
- **初始化回调次数**：当前实现中，初始化阶段可能触发 **≥1 次** `onScroll`（`position` 与 `size` 各自更新各触发一次）。未来可能改为**单帧合并一次**。
- **水平滚动**：`scrollToLeft/Right` 尚未实现，仅打印告警。
- **边界判断**：`isBottom/isRight` 带 **1px 容差**，以减少缩放/浮点误差。
- **目标变更**：仅修改 `ref.current` 不会触发重绑；若容器会替换，请在 `options.deps` 传入标识（或更换 ref 对象）。
- **事件目标**：`document/window` 的滚动与尺寸监听绑定在 **`window`**；元素尺寸优先通过 `ResizeObserver` 监听，旧环境降级为 `window.resize`。
- **SSR**：在非浏览器环境下请跳过调用或做能力判断。

------

## 🔹 `useReactiveRef`

`useReactiveRef` 创建一个响应式的 `ref`，用于在闭包中获取最新的 prop 值，避免 stale closure 问题。适合在事件处理函数或异步回调中需要访问最新状态但又不想触发频繁重渲染的情况。

### 🌟 主要作用
- ✅ **响应式 ref**：创建一个响应式的 `ref`，用于在闭包中获取最新的 prop 值；
- 🔥 **避免重渲染**：在不触发组件重渲染的情况下，通过 `ref` 获取最新的状态值；
- 🎯 **解决闭包陷阱**：尤其适合在事件处理函数或异步回调中需要访问最新状态但又不想触发频繁重渲染的情况。

### 📦 API

```typescript
declare const useReactiveRef: <T = any>(prop: T) => react.MutableRefObject<T>;
```

### 📖 参数说明
| 参数 | 类型 | 说明 |
|------|------|------|
| prop | `T` | 需要创建响应式 ref 的初始值，可以是任意类型 |

### 📦 返回值说明
| 返回值 | 类型 | 说明 |
|--------|------|------|
| ref | `MutableRefObject<T>` | 创建的响应式 ref 对象，始终指向最新的 prop 值 |

### ✨ 使用示例
#### 🌰 示例代码

```tsx
import React, { useState, useEffect } from 'react';
import { useReactiveRef } from '@gpx/common-funcraft';

function Example() {
    const [count, setCount] = useState(0);
    const countRef = useReactiveRef(count);

    useEffect(() => {
        const interval = setInterval(() => {
            console.log('Current count:', countRef.current);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>Increment</button>
        </div>
    );
}
export default Example;
```

#### 🌟 场景说明
上述示例中：
- `countRef` 始终指向最新的 `count` 值；
- 在 `setInterval` 回调中使用 `countRef.current` 获取最新的 `count`，避免了闭包陷阱问题；
- 组件状态更新不会触发 `setInterval` 回调的重新创建。

------
## 🔹 `useEvent`

`useEvent` 创建一个稳定的事件处理函数引用，确保在组件重新渲染时不会改变引用，同时始终调用最新的回调函数。适合在需要传递事件处理函数给子组件或第三方库时使用。

### 🌟 主要作用
- ✅ **稳定引用**：创建一个稳定的事件处理函数引用，避免因组件重新渲染导致引用变化；
- 🔥 **最新回调**：确保事件处理函数始终调用最新的回调函数；
- 🎯 **简化代码**：避免在 `useCallback` 中手动管理依赖数组。

### 📦 API

```typescript
declare const useEvent: <T extends (...args: any[]) => any>(handler?: T) => T;
```

### 📖 参数说明
| 参数 | 类型 | 说明 |
|------|------|------|
| handler | `T` | 事件处理函数，可以是任意函数类型 |

### 📦 返回值说明
| 返回值 | 类型 | 说明 |
|--------|------|------|
| eventHandler | `T` | 稳定的事件处理函数引用，始终调用最新的回调函数 |

### ✨ 使用示例
#### 🌰 示例代码
```tsx
import React, { useState } from 'react';
import { useEvent } from '@gpx/common-funcraft';

function Example() {
    const [count, setCount] = useState(0);

    const handleClick = useEvent(() => {
        setCount(prevCount => prevCount + 1);
    });

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={handleClick}>Increment</button>
        </div>
    );
}
export default Example;
```

#### 🌟 场景说明
上述示例中：
- `handleClick` 是一个稳定的事件处理函数引用；
- 每次点击按钮时，都会调用最新的回调函数，正确更新 `count` 状态；
- 组件重新渲染不会导致 `handleClick` 引用变化。

------

## 🔹 `useSafeState`

`useSafeState` 是一个带「卸载安全保护」的 `useState` 替代方案。
 它在保持原生 API 体验的基础上，为 `setState` 额外提供了一个可选参数，用于在组件卸载后安全忽略某些状态更新，避免控制台充斥 `setState on unmounted component` 警告。

### 🌟 主要作用

- ✅ **避免卸载后更新状态的警告**：在组件已卸载的情况下，可以选择性跳过本次 `setState`；
- 🔄 **更安全的异步状态更新**：适用于定时器、请求回调、事件监听等不受 React 生命周期控制的异步逻辑；
- 🎯 **显式控制，而非全局静默吞掉**：只有在你明确传入 `ignoreDestroy` 时才会忽略更新，不会偷偷掩盖真实问题。

### 📦 API

```
declare function useSafeState<S>(
  initialState: S | (() => S)
): [S, (value: React.SetStateAction<S>, ignoreDestroy?: boolean) => void];
```

### 📖 参数说明

#### `initialState`

| 参数名         | 类型          | 说明                                                         |
| -------------- | ------------- | ------------------------------------------------------------ |
| `initialState` | `S | () => S` | 初始状态值。与原生 `useState` 一致，支持直接传值或惰性初始化函数。 |

### 📦 返回值说明

| 返回值     | 类型                                                         | 说明                                                         |
| ---------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| `state`    | `S`                                                          | 当前状态值。                                                 |
| `setState` | `(value: SetStateAction<S>, ignoreDestroy?: boolean) => void` | 状态更新函数。第一个参数同 `useState`，第二个可选参数用于控制卸载安全行为：<br/>- 不传或为 `false`：行为与原生 `setState` 一致；<br/>- 为 `true` 且组件已卸载：本次更新会被安全忽略。 |

------

### ✨ 使用示例

#### 1️⃣ 异步请求中避免卸载后 `setState`

```tsx
import React, { useEffect } from 'react';
import { useSafeState } from '@gpx/common-funcraft';

function AsyncExample() {
    const [data, setData] = useSafeState<string | null>(null);
    const [loading, setLoading] = useSafeState(false);

    useEffect(() => {
        setLoading(true);

        const controller = new AbortController();

        fetch('/api/data', { signal: controller.signal })
            .then(res => res.text())
            .then(text => {
                // 第二个参数传 true：
                // 如果组件此时已经卸载，本次更新会被安全忽略
                setData(text, true);
            })
            .catch(() => {
                // 这里视情况决定是否忽略卸载后的更新
                setData(null, true);
            })
            .finally(() => {
                setLoading(false, true);
            });

        return () => {
            controller.abort();
        };
    }, []);

    if (loading) return <div>加载中...</div>;
    return <div>数据：{data ?? '暂无'}</div>;
}

export default AsyncExample;
```

##### 🌟 场景说明

- 请求返回的时间不受 React 控制，完全可能在组件卸载后才完成；
- 使用 `setData(next, true)` / `setLoading(next, true)`：
  - 若组件仍挂载 → 正常更新；
  - 若组件已卸载 → 本次更新被忽略，不会触发 React 警告；
- 你可以明确区分哪些异步更新“即使丢掉也没问题”，而不是全局静默吞掉所有卸载后的更新。

------

#### 2️⃣ 普通场景下直接当作 `useState` 使用

```tsx
import React from 'react';
import { useSafeState } from '@gpx/common-funcraft';

function Counter() {
    const [count, setCount] = useSafeState(0);

    const handleIncrement = () => {
        // 不传 ignoreDestroy，行为与原生 useState 完全一致
        setCount(prev => prev + 1);
    };

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={handleIncrement}>增加</button>
        </div>
    );
}

export default Counter;
```

##### 🌟 场景说明

- 在绝大多数普通同步/简单场景中，你可以完全把 `useSafeState` 当作 `useState` 使用；
- 只有在“**异步 + 可能在卸载后才触发**”的更新中，才需要考虑传入 `ignoreDestroy`。

------

#### 3️⃣ 搭配事件监听/定时器的使用场景

```tsx
import React, { useEffect } from 'react';
import { useSafeState } from '@gpx/common-funcraft';

function Timer() {
    const [tick, setTick] = useSafeState(0);

    useEffect(() => {
        const id = window.setInterval(() => {
            // 周期性回调，可能在组件卸载后仍触发：
            // 传入 ignoreDestroy = true，避免卸载后继续 setState
            setTick(prev => prev + 1, true);
        }, 1000);

        return () => {
            window.clearInterval(id);
        };
    }, []);

    return <div>Tick: {tick}</div>;
}

export default Timer;
```

##### 🌟 场景说明

- `setInterval` 是典型的“生命周期之外”的异步源；
- 使用 `useSafeState` 并在回调里传入 `ignoreDestroy = true`，即使定时器清理不及时，也不会在卸载后打警告；
- 更适合通用组件内部、复杂交互中统一兜底处理。

---

## 🔹 `useMergedState`

`useMergedState` 用于统一管理「受控值」与「非受控值」，封装了组件中常见的 `value` / `defaultValue` / 内部状态三者的合并逻辑。
 非常适合封装通用组件时处理双模式（受控 / 非受控）状态。

### 🌟 主要作用

- ✅ **统一受控 / 非受控逻辑**：支持 `value`、`defaultValue` 和内部状态的优先级合并；
- 🔄 **对齐组件使用习惯**：对外暴露的行为与常见 UI 组件库一致（如输入框、选择器等）；
- 📣 **状态变更通知**：通过 `onChange` 统一向外透出值变化，携带当前值与前一次值；
- 🎯 **派生视图值**：支持通过 `postState` 在对外暴露前对合并结果做映射（格式化、兜底等）。

### 📦 API

```tsx
declare function useMergedState<T, R = T>(
  defaultStateValue: T | (() => T),
  options?: {
    defaultValue?: T | (() => T);
    value?: T;
    onChange?: (value: T, prevValue: T) => void;
    postState?: (value: T) => R;
  }
): [R, React.Dispatch<React.SetStateAction<T>>];
```

### 📖 参数说明

#### `defaultStateValue`

| 参数名              | 类型          | 说明                                                         |
| ------------------- | ------------- | ------------------------------------------------------------ |
| `defaultStateValue` | `T | () => T` | 内部状态兜底初始值。仅当未提供 `options.value` 和 `options.defaultValue` 时使用。支持直接传值或惰性初始化函数。 |

#### `options`

| 字段名         | 类型                          | 说明                                                         |
| -------------- | ----------------------------- | ------------------------------------------------------------ |
| `defaultValue` | `T | () => T`                 | 非受控模式下的默认值，优先级高于 `defaultStateValue`。支持直接传值或惰性初始化函数。 |
| `value`        | `T`                           | 受控值。**只要该值不是 `undefined`，Hook 就处于受控模式，对外值以此为准。** |
| `onChange`     | `(value: T, prev: T) => void` | 状态变化回调。在内部值变化后触发，传入当前值和上一次值。     |
| `postState`    | `(value: T) => R`             | 对合并后的原始值做一次映射，仅影响对外暴露的返回值，不改变内部实际存储的值。 |

### 📦 返回值说明

| 返回值           | 类型                                      | 说明                                                         |
| ---------------- | ----------------------------------------- | ------------------------------------------------------------ |
| `mergedValue`    | `R`                                       | 对外暴露的当前值。受控模式下来自 `options.value`，非受控模式下来自内部状态，并可经过 `postState` 映射。 |
| `setMergedValue` | `React.Dispatch<React.SetStateAction<T>>` | 更新内部原始值的 `setState` 函数，签名与原生 `useState` 一致。 |

------

### ✨ 使用示例

#### 1️⃣ 非受控用法：支持 `defaultValue`

```tsx
import React from 'react';
import { useMergedState } from '@gpx/common-funcraft';

function UncontrolledInput() {
    const [value, setValue] = useMergedState<string>('', {
        defaultValue: '初始文本',
    });

    return (
        <div>
            <p>当前值：{value}</p>
            <input
                value={value}
                onChange={e => setValue(e.target.value)}
            />
        </div>
    );
}

export default UncontrolledInput;
```

**场景说明：**

- 未传入 `value`，Hook 处于**非受控模式**；
- 初始值来自 `defaultValue: "初始文本"`；
- 组件内部通过 `setValue` 自行管理状态。

------

#### 2️⃣ 受控用法：统一 `value` / `onChange` 处理

```tsx
import React from 'react';
import { useMergedState } from '@gpx/common-funcraft';

interface InputProps {
    value?: string;
    defaultValue?: string;
    onChange?: (next: string) => void;
}

const MyInput: React.FC<InputProps> = props => {
    const [value, setValue] = useMergedState<string>('', {
        value: props.value,
        defaultValue: props.defaultValue,
        onChange: (next) => props.onChange?.(next),
    });

    return (
        <input
            value={value}
            onChange={e => setValue(e.target.value)}
        />
    );
};

export default MyInput;
```

**场景说明：**

- 当父组件传入 `value` 时：`MyInput` 进入**受控模式**，显示由外部 `value` 决定；
- 当父组件不传 `value` 时：`MyInput` 进入**非受控模式**，内部使用 `defaultValue`/`defaultStateValue` 初始化；
- 内部统一通过 `setValue` 更新，`useMergedState` 帮你处理模式切换和 `onChange` 回调。

------

#### 3️⃣ 使用 `postState` 做值映射（例如 Date → 时间戳）

```tsx
import React from 'react';
import { useMergedState } from '@gpx/common-funcraft';

interface DatePickerProps {
    value?: Date | null;
    onChange?: (next: Date | null) => void;
}

const TimestampDisplay: React.FC<DatePickerProps> = props => {
    const [timestamp, setDate] = useMergedState<Date | null, number | null>(null, {
        value: props.value,
        onChange: (nextDate, prevDate) => {
            console.log('Date changed:', prevDate, '->', nextDate);
            props.onChange?.(nextDate);
        },
        postState: date => (date ? date.getTime() : null),
    });

    return (
        <div>
            <button onClick={() => setDate(new Date())}>
                设置为当前时间
            </button>
            <p>当前时间戳：{timestamp ?? '未选择'}</p>
        </div>
    );
};

export default TimestampDisplay;
```

**场景说明：**

- 内部原始值类型是 `Date | null`；
- 通过 `postState` 将合并后的值映射为 `number | null` 的时间戳，对视图层更友好；
- `setDate` / `onChange` 始终处理的是 `Date`，视图拿到的是转换后的 `timestamp`。

---

## 🔗 其他文档索引

- 🛠️ [工具函数使用指南](function.md)
- 🎨 [SCSS 变量 & Mixin 说明](scss.md)
- 📜 [类型声明说明](type.md)
- 📆 [更新日志](../CHANGELOG.md)

---

📌 **更多 Hook 持续更新中，请关注 [CHANGELOG.md](../CHANGELOG.md)。**

返回 [README](../../README.md) 查看完整文档索引。
