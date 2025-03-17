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
function useStateRef<S>(initialState: S): [S, Dispatch<SetStateAction<S>>, RefObject<S>];
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

---

## 🚧 注意事项

- 本 Hook 依赖于 React 16.9 及以上版本。
- 请避免直接修改 ref 的值，状态更新请使用 `setState` 方法。

---

## 🔗 其他文档索引

- 🛠️ [工具函数使用指南](function.md)
- 🎨 [SCSS 变量 & Mixin 说明](scss.md)
- 📜 [类型声明说明](type.md)
- 📆 [更新日志](../CHANGELOG.md)

---

📌 **更多 Hook 持续更新中，请关注 [CHANGELOG.md](../CHANGELOG.md)。**

返回 [README](../../README.md) 查看完整文档索引。
