# 🛠️ 工具函数使用指南

**Funcraft** 提供了一组高质量、实用的工具函数，帮助你高效地完成日常开发任务。以下是各个工具函数的详细说明和使用示例。

## 📌 默认值处理 (`defaults`)

### 🔸 defaultGetter

> **说明**：用于获取多个值时提供默认值的方法。如果原始值为 `null` 或 `undefined`，则返回第一个有值的参数。

**示例：**

```ts
import { defaultGetter } from "@gpx/common-funcraft";

defaultGetter(null, undefined, '默认值'); // "默认值"
defaultGetter(null, '实际值', '默认值');  // "实际值"
defaultGetter(undefined, '有效值', '默认值'); // "有效值"
```

---

### 🔸 defaultMerge

> **说明**：对源对象进行默认值合并处理。如果源对象为 `null` 或 `undefined`
> ，则返回默认对象的副本。否则，递归合并未定义或为 `null` 的属性。

**示例：**

```ts
import { defaultMerge } from "@gpx/common-funcraft";

defaultMerge({ name: 'Alice' }, { name: 'Unknown', age: 30 });
// 返回: { name: 'Alice', age: 30 }

defaultMerge(null, { name: 'Unknown', age: 30 });
// 返回: { name: 'Unknown', age: 30 }
```

---

### 🔸 deepGet

> **说明**：安全地从对象中获取深层嵌套的属性值，支持任意层级的属性路径。当对象路径中任一属性为 `null` 或 `undefined` 时，返回 `undefined`.
> 
> 适用于不支持可选链操作符（?.）的环境.

**示例：**

```ts
const obj = {
    user: {
        profile: {
            name: 'Alice',
            address: {
                city: 'Hangzhou',
                zip: '310000'
            }
        }
    }
};

// 正常访问存在的深层属性
deepGet(obj, 'user', 'profile', 'name');
// 返回: 'Alice'

// 深层属性不存在，返回 undefined
deepGet(obj, 'user', 'profile', 'age');
// 返回: undefined

// 中间路径不存在，安全返回 undefined
deepGet(obj, 'user', 'contact', 'email');
// 返回: undefined
```

---

## 📂 文件处理 (`file`)

### 🔸 formatFileSize

> **说明**：格式化文件大小，将字节数转为易读单位（Bytes, KB, MB, GB, TB）。

**示例：**

```ts
import { formatFileSize } from "@gpx/common-funcraft";

formatFileSize(1024);        // "1.0 KB"
formatFileSize(1048576);     // "1.0 MB"
formatFileSize(1073741824);  // "1.0 GB"
formatFileSize(0);           // "0 Byte"
```

---

## 🔢 数字处理 (`number`)

### 🔸 formatNumber

> **说明**：数字千分位格式化，支持数字或字符串输入，若无法转换为数字则抛出异常。

**示例：**

```ts
import { formatNumber } from "@gpx/common-funcraft";

formatNumber(1234567.89);  // "1,234,567.89"
formatNumber("1000");      // "1,000.00"
formatNumber("invalid");   // 抛出异常
```

---

## 🕒 动画调度 (`raf`)

### 🔸 wrapperRaf

> **说明**：封装了兼容性强的动画帧调度方法，用于高效执行异步任务、动画更新及性能优化场景。

**使用示例：**

1️⃣ **单次动画帧调用**

```ts
import { wrapperRaf } from "@gpx/common-funcraft";

wrapperRaf(() => {
    console.log("下一帧执行逻辑");
});
```

2️⃣ **多次动画帧调用（递归）**

```ts
wrapperRaf(() => {
    console.log("动画帧触发");
}, 3); // 连续执行3个动画帧
```

3️⃣ **取消动画帧任务**

```ts
const id = wrapperRaf(() => console.log("不会执行"), 3);
wrapperRaf.cancel(id);
```

---

## 🔍 验证函数 (`validation`)

### 🔸 isEmail

> **说明**：判断是否是有效的 Email 地址。

```ts
import { isEmail } from "@gpx/common-funcraft";

isEmail("example@example.com"); // true
isEmail("not-an-email");        // false
```

### 🔸 isMobile

> **说明**：判断是否是有效的中国大陆手机号。

```ts
import { isMobile } from "@gpx/common-funcraft";

isMobile("13800138000"); // true
isMobile("1234567890");  // false
```

### 🔸 isPhone

> **说明**：判断是否是有效的固定电话号码。

```ts
import { isPhone } from "@gpx/common-funcraft";

isPhone("010-12345678"); // true
isPhone("12345678");     // false
```

### 🔸 isEmpty

> **说明**：判断传入的值是否为空（包含 `null`、`undefined`、空字符串、空数组、空对象）。

```ts
import { isEmpty } from "@gpx/common-funcraft";

isEmpty(null);              // true
isEmpty(undefined);         // true
isEmpty("");                // true
isEmpty([]);                // true
isEmpty({});                // true
isEmpty(0);                 // false
isEmpty("Hello");           // false
isEmpty([1, 2, 3]);         // false
isEmpty({ key: "value" });  // false
```

---

## 🌐 视图 & 滚动处理 (`view`)

### 🔸 isWindow

> **说明**：判断对象是否为浏览器环境中的 `window` 对象。

```ts
import { isWindow } from "@gpx/common-funcraft";

isWindow(window);     // true
isWindow(document);   // false
isWindow({});         // false
```

---

### 🔸 getScroll

> **说明**：获取目标元素或窗口的垂直滚动位置。

```ts
import { getScroll } from "@gpx/common-funcraft";

window.scrollTo(0, 200);
getScroll(window);  // 200

document.documentElement.scrollTop = 300;
getScroll(document); // 300
```

---

### 🔸 easeInOutCubic

> **说明**：三次缓动函数，用于计算动画过渡的平滑位置。

```ts
import { easeInOutCubic } from "@gpx/common-funcraft";

easeInOutCubic(250, 0, 100, 500); // 计算当前动画进度 (250ms 时位置)
```

---

### 🔸 scrollTo

> **说明**：实现平滑滚动效果。

```ts
import { scrollTo } from "@gpx/common-funcraft";

scrollTo(500, {
    duration: 600,
    callback: () => console.log("滚动完成"),
});
```

---

## 📌 数组处理 (`flatten`)

### 🔸 flatten

> **说明**：用于将多维对象数组递归地转换为一维数组。该函数适用于需要将树形结构数据扁平化的场景，如下拉列表、表格展示或对树状数据的批量处理。

**使用须知：**

- 请确保传入的数据源中，每个对象在指定的 `childrenKey` 属性上，要么为数组，要么为 `undefined`。
- 由于函数为递归调用，当数据层级较深时可能会对性能产生一定影响。

**示例：**

```ts
import { flatten } from "@gpx/common-funcraft";

interface TreeNode {
  id: number;
  name: string;
  children?: TreeNode[];
}

const treeData: TreeNode[] = [
  {
    id: 1,
    name: '节点1',
    children: [
      { id: 2, name: '节点1-1' },
      {
        id: 3,
        name: '节点1-2',
        children: [
          { id: 4, name: '节点1-2-1' }
        ]
      }
    ]
  },
  { id: 5, name: '节点2' }
];

// 扁平化后得到的数组：
// [
//   { id: 1, name: '节点1', children: [...] },
//   { id: 2, name: '节点1-1' },
//   { id: 3, name: '节点1-2', children: [...] },
//   { id: 4, name: '节点1-2-1' },
//   { id: 5, name: '节点2' }
// ]
const flatData = flatten<TreeNode>(treeData, 'children');
console.log(flatData);
```

---

## 🔗 其他文档索引

- 📌 [React Hook 使用指南](hook.md)
- 🎨 [SCSS 变量 & Mixin 说明](scss.md)
- 📜 [类型声明说明](type.md)
- 📆 [更新日志](../CHANGELOG.md)

---
📌 **更多函数持续更新中，请关注 [CHANGELOG.md](../CHANGELOG.md)。**

返回 [README](../../README.md) 查看完整文档索引。
