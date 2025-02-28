# Funcraft 📦

🚀 **Funcraft** 是一个轻量级、多功能的前端工具库，包含 **React Hook**、**通用工具函数**、**文件处理方法** 和 **样式变量**，适用于现代前端项目。

## 📌 特性

- ✅ **React Hook**：提供 `useStateRef`，管理 `state` 并同步 `ref`，避免 `useCallback` 频繁重建。
- ✅ **实用工具函数**：包含默认值处理、文件大小格式化、数值格式化等常见功能。
- ✅ **支持 ESM & CJS**：可用于 **Node.js** 和 **浏览器端**，按需引入，支持 **Tree Shaking**。
- ✅ **SCSS 变量封装**：提供一组常用的样式变量，适用于 UI 主题定制。

📥 安装

```sh
npm install funcraft
# 或者使用 yarn
yarn add funcraft
# 或者使用 pnpm
pnpm add funcraft
```

## 📜 API 参考

###### 🌀 `useStateRef<T>(initialState: T): [T, setState: Function, ref: Ref<T>]`

> **描述**: 结合 `useState` 和 `useRef`，管理状态及其引用，避免 `useCallback` 因 `state` 变化而重新创建函数。

```ts
const [state, setState, stateRef] = useStateRef(0);
```

###### 📌 `defaultGetter<T>(original: T | undefined | null, defaultValue: T): T`

> **描述**: 当 `original` 为空 (`null` 或 `undefined`) 时，返回 `defaultValue`。

```ts
const result = defaultGetter(null, "默认值"); // "默认值"
```

###### 📌 `defaultMerge<T>(source: T | null | undefined, defaultObj: Partial<T>): T`

> **描述**: 递归合并 `source` 对象中的空值 (`null` 或 `undefined`)，使用 `defaultObj` 作为默认值。

```ts
const merged = defaultMerge({ age: 25 }, { name: "Alice", age: 30 });
// { name: "Alice", age: 25 }
```

###### 📌 `formatFileSize(bytes: number): string`

> **描述**: 将字节数转换为易读的格式 (`Bytes`、`KB`、`MB`、`GB`、`TB`)。

```ts
console.log(formatFileSize(1024)); // "1.0 KB"
```

###### 📌 `formatNumber(value: number | string): string`

> **描述**: 处理数值的千分位格式化，并保留两位小数。

```ts
console.log(formatNumber(1234567.89)); // "1,234,567.89"
console.log(formatNumber("1000")); // "1,000.00"
```

###### 📌 `isEmpty(value: any): boolean`

> **描述**: 判断值是否为空 (`null`, `undefined`, `""`, `[]`, `{}`)。

```ts
console.log(isEmpty(null)); // true
console.log(isEmpty(0)); // false
```

## **🎨 SCSS 主题变量**

本库提供了一套常用的 **SCSS 变量**，可用于 UI 主题定制。

```scss
@use "funcraft/styles/variables"

body {
  background-color: variables.$c-primary;
  color: variables.$c-text;
}
```

| 变量名称       | 说明         | 示例值    |
| -------------- | ------------ | --------- |
| `$c-primary`   | 主色         | `#0a82e5` |
| `$c-border`    | 边框色       | `#cccccc` |
| `$c-text`      | 主要文本颜色 | `#333333` |
| `$c-margin-sm` | 小间距       | `8px`     |

## **🚀 快速使用**

###### **1️⃣ 使用 React Hook：`useStateRef`**

```jsx
import React from "react";
import { useStateRef } from "funcraft";

const ExampleComponent = () => {
  const [count, setCount, countRef] = useStateRef(0);

  const handleClick = React.useCallback(() => {
    console.log("当前 count 值：", countRef.current);
  }, [countRef]); // 避免因 count 变化导致回调函数重新创建

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount((prev) => prev + 1)}>增加</button>
      <button onClick={handleClick}>日志输出</button>
    </div>
  );
};
```

###### **2️⃣ 默认值处理**

```js
import { defaultGetter, defaultMerge } from "funcraft";

// 获取默认值
const name = defaultGetter(null, "默认名"); // "默认名"

// 对象默认值合并
const mergedObject = defaultMerge({ age: 25 }, { name: "Alice", age: 30 });
// 结果: { name: "Alice", age: 25 }
```

###### **3️⃣ 文件大小格式化**

```js
import { formatFileSize } from "funcraft";

console.log(formatFileSize(1024)); // "1.0 KB"
console.log(formatFileSize(1048576)); // "1.0 MB"
console.log(formatFileSize(1073741824)); // "1.0 GB"
```

------

###### **4️⃣ 数字格式化**

```js
import { formatNumber } from "funcraft";

console.log(formatNumber(1234567.89)); // "1,234,567.89"
console.log(formatNumber("1000")); // "1,000.00"
```

###### **5️⃣ 数据验证**

```js
import { isEmpty } from "funcraft";

console.log(isEmpty(null)); // true
console.log(isEmpty("")); // true
console.log(isEmpty([])); // true
console.log(isEmpty({})); // true
console.log(isEmpty(0)); // false
```

## 📄 License

Funcraft 使用 **MIT 许可证**，可自由使用、修改和分发。

### **🎯 结语**

Funcraft 提供了一系列常用的 **Hook、工具函数、数值处理和样式变量**，希望能帮助你更高效地开发 React/Vue/Node.js 项目！🚀

------

## **💡 未来计划**

- ✅ **更多 React Hook**
- ✅ **增强数值 & 日期处理工具**
- ✅ **增加更多 UI 主题变量**
- ✅ **优化 TypeScript 类型**

## **⚠️ 开发状态**

本库仍处于 **开发阶段**，部分功能可能 **不稳定或存在变更**，请在非生产环境中谨慎使用。  
如果你对本项目感兴趣，欢迎提供 **建议、反馈或贡献代码**！🚀