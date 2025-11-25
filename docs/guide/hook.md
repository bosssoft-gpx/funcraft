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

## 🔗 其他文档索引

- 🛠️ [工具函数使用指南](function.md)
- 🎨 [SCSS 变量 & Mixin 说明](scss.md)
- 📜 [类型声明说明](type.md)
- 📆 [更新日志](../CHANGELOG.md)

---

📌 **更多 Hook 持续更新中，请关注 [CHANGELOG.md](../CHANGELOG.md)。**

返回 [README](../../README.md) 查看完整文档索引。
