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

> **说明**：格式化文件大小，将字节数转为更易读的单位（Bytes、KB、MB、GB、TB），支持可选配置自定义格式表现。

#### **函数签名：**

```ts
function formatFileSize(bytes: number, options?: { omitDecimal?: boolean }): string;
```

#### **参数说明：**

| 参数名    | 类型                        | 说明                             |
| --------- | --------------------------- | -------------------------------- |
| `bytes`   | `number`                    | 要格式化的字节大小，必须为非负数 |
| `options` | `{ omitDecimal?: boolean }` | 是否省略小数部分，默认为 `false` |

- `omitDecimal: true` 表示仅保留整数部分（自动四舍五入）

#### **返回值：**

- 返回格式化后的字符串，附带单位。例如 `"1.0 KB"`、`"2 MB"`。

------

#### **示例：**

```ts
import { formatFileSize } from "@gpx/common-funcraft";

formatFileSize(1024);                    // "1.0 KB"
formatFileSize(1048576);                 // "1.0 MB"
formatFileSize(1073741824);              // "1.0 GB"
formatFileSize(0);                       // "0 Byte"
formatFileSize(1536, { omitDecimal: true }); // "2 KB"
formatFileSize(1536, { omitDecimal: false }); // "1.5 KB"
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

### 🔸 isPostalCode

> **说明**：判断是否是有效的中国大陆邮政编码。

```ts
import { isPostalCode } from "@gpx/common-funcraft";

isPostalCode("310000"); // true
isPostalCode("12345");  // false
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

### 🔸 getMaxZIndex

> **说明**：获取指定元素祖先链中的最大 `z-index` 值。

```
ts复制编辑import { getMaxZIndex } from "@gpx/common-funcraft";

const panel = document.getElementById("progress-panel");
const maxZ = getMaxZIndex(panel); // 比如：返回 10002

panel.style.zIndex = `${maxZ + 1}`; // 保证进度面板显示在最上层
```

**场景说明**：

- 用于需要将浮层、弹窗、进度条等元素动态置于最上层时；
- 自适应页面中已有元素的 `z-index`，避免被遮挡。

**参数**：

- `el: HTMLElement` – 当前参考元素，将从其向上查找父级 `z-index`。
- `maxDepth?: number` – 向上查找的最大层级（默认：20），避免性能损耗。

**返回值**：

- `number` – 所有祖先元素中的最大 `z-index`。

---

### 🔸 canAccessIFrame

> **说明**：检测一个 `iframe` 是否**可被同源访问**。内部通过尝试读取 `iframe.contentWindow.document.domain` 并捕获异常来判断，同源返回 `true`，跨域返回 `false`。

#### **函数签名：**

```
function canAccessIFrame(iframe: HTMLIFrameElement): boolean;
```

#### **参数说明：**

| 参数名   | 类型                | 说明                             |
| -------- | ------------------- | -------------------------------- |
| `iframe` | `HTMLIFrameElement` | 需要检测的目标 `iframe` 元素实例 |

#### **返回值：**

- `boolean`：同源可访问返回 `true`；跨域（或不可访问）返回 `false`。
   *函数本身不抛错，跨域场景请在上层按需告警或降级处理。*

------

### 🔸 getTargetElement

> **说明**：统一解析“目标”对象，支持**直接元素**、**Ref 对象**、或**返回目标的函数**；无法获取时返回 `defaultElement` 作为兜底。

#### **函数签名：**

```
function getTargetElement<T extends HTMLElement | Element | Window | Document = Element>(
  target: BasicTarget<T>,
  defaultElement?: T
): T | undefined;
```

#### **参数说明：**

| 参数名           | 类型             | 说明                                                         |
| ---------------- | ---------------- | ------------------------------------------------------------ |
| `target`         | `BasicTarget<T>` | 目标对象：`T` 本身 / `RefObject<T | null>` / `() => T | null` |
| `defaultElement` | `T`（可选）      | 如果无法从 `target` 获取到有效目标时使用的兜底元素           |

#### **返回值：**

- `T \| undefined`：解析到的目标实例；若解析失败则返回 `defaultElement`；若也未提供兜底，返回 `undefined`。

> 小贴士：该函数每次调用都会**读取 `ref.current` 的当前值**；但要让上层 `effect` 感知到目标变化，仍需让 `effect` 重新执行（例如通过依赖变更）。

------

### 🔸 getScrollTopForChild

> **说明**：计算**将容器滚动到使子元素顶端对齐**所需的 `scrollTop` 值。相较于直接用 `offsetTop`，该方法通过 `getBoundingClientRect` 计算，更适用于复杂布局（如 `transform` / 非标准 `offsetParent`）。

#### **函数签名：**

```
function getScrollTopForChild(
  container: HTMLElement | Document | Window,
  child: HTMLElement
): number;
```

#### **参数说明：**

| 参数名      | 类型                              | 说明                                                    |
| ----------- | --------------------------------- | ------------------------------------------------------- |
| `container` | `HTMLElement | Document | Window` | 滚动容器；支持页面（`window/document`）或任意可滚动元素 |
| `child`     | `HTMLElement`                     | 需要滚动到其顶部对齐的子元素（应当是容器的后代元素）    |

#### **返回值：**

- `number`：使子元素顶端与容器可视区域顶边对齐所需设置的 `scrollTop`。

> 备注：
>
> - 当 `container` 为 `window` 或 `document` 时，结果为 `child.getBoundingClientRect().top + pageYOffset/scrollY`。
> - 当 `container` 为元素时，结果为 `childRect.top - containerRect.top + container.scrollTop`。
> - 仅计算**垂直方向**（`top`）；如需横向，请实现对应的 `getScrollLeftForChild`。
> - 若 `child` 非 `container` 的后代，计算结果不具语义保证。

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

## 📌 Vue 工具函数

### 🔸 safeRegisterComponents

> **说明**：用于安全地注册 Element UI 的 Vue 组件。该方法会根据组件库版本及 Vue 的全局注册状态，自动判断是否需要局部注册组件，避免重复注册或因未注册导致的渲染异常。

该函数支持以下两种组件声明方式：

- 具名声明（自定义注册名）：
   `{ ElButton: Button }`
- 简洁声明（自动使用组件 `.name`）：
   `{ Button, Dialog }`

可作为组件库内部注册 Element UI 的辅助方法，配合外部版本控制策略，避免组件表现异常。

------

**使用示例：**

```ts
import Vue from 'vue';
import { Button, Dialog } from 'element-ui';
import { safeRegisterComponents } from '@gpx/common-funcraft';

export default {
  components: {
    // 支持自动注册名
    ...safeRegisterComponents(Vue, {
      Button,
      Dialog
    })
  }
};
```

也支持显式注册名：

```ts
safeRegisterComponents(Vue, {
  ElButton: Button,
  ElDialog: Dialog
});
```

------

**高级用法：版本门槛控制**

你可以传入 `versionThreshold` 作为第三个参数，控制最小兼容版本：

```ts
safeRegisterComponents(Vue, {
  Button,
  Dialog
}, {
  versionThreshold: '2.13.0'
});
```

------

**返回值：**

返回一个组件对象，可用于 `components: { ... }` 的局部注册：

```ts
{
  ElButton: Button,
  ElDialog: Dialog
}
```

如果所有组件都已在全局注册，或满足最低版本要求，则返回空对象。

------

**适用场景：**

- 构建组件库时使用 Element UI 等组件库的部分组件；
- 应用方无法保证组件已注册或版本一致时；
- 希望组件库以最小侵入方式提供所需依赖环境；
- 避免 `Vue.use()` 或 `Vue.component()` 带来的全局污染。

---

## 📌 对象字段操作 (`object`)

### 🔸 omit

> **说明**：从对象中排除指定的字段，返回一个新的对象，保留原对象中未被排除的字段。适用于在组件开发中去除私有字段、精简传参、构造公共结构等场景。

**示例：**

```ts
import { omit } from "@gpx/common-funcraft";

const original = { a: 1, b: 2, c: 3 };

// 排除一个字段
omit(original, ['b']); 
// => { a: 1, c: 3 }

// 排除多个字段
omit(original, ['a', 'c']); 
// => { b: 2 }

// 传入空数组时返回原始对象的副本
omit(original, []); 
// => { a: 1, b: 2, c: 3 }

// 对只读字段数组也兼容
const readonlyFields = ['a'] as const;
omit(original, readonlyFields); 
// => { b: 2, c: 3 }

// 不会修改原对象
const copy = omit(original, ['a']);
console.log(original); 
// => { a: 1, b: 2, c: 3 }
```

### 🔸safeErrorWrapper
> **说明**：将任意类型的错误包装成 Error 对象，确保一致的错误处理体验。适用于捕获未知异常并统一处理的场景。

**示例：**

```ts
import { safeErrorWrapper } from "@gpx/common-funcraft";

// 传入 Error 实例，返回原始 Error
const err1 = safeErrorWrapper(new Error("Something went wrong"));
// => Error("Something went wrong")

// 传入字符串，包装为 Error
const err2 = safeErrorWrapper("A string error");
// => Error("A string error")

// 传入包含 message 字段的对象，提取 message
const err3 = safeErrorWrapper({ message: "An object error" });
// => Error("An object error")

// 传入数字，使用默认错误信息
const err4 = safeErrorWrapper(42);
// => Error("Unknown error")

// 传入 null，使用默认错误信息
const err5 = safeErrorWrapper(null);
// => Error("Unknown error")

// 传入无法识别的类型并指定 fallback，返回自定义错误信息
const err6 = safeErrorWrapper(undefined, "自定义错误信息");
// => Error("自定义错误信息")
```

---

### 🔸 depsAreSame

> **说明**：对比两组依赖数组是否“浅层等值”。逐项使用 `!==` 比较（**非** `Object.is`），长度不同或任一项不相等则返回 `false`。

#### **函数签名：**

```
function depsAreSame(oldDeps: DependencyList, deps: DependencyList): boolean;
```

#### **参数说明：**

| 参数名    | 类型             | 说明           |
| --------- | ---------------- | -------------- |
| `oldDeps` | `DependencyList` | 旧的依赖项数组 |
| `deps`    | `DependencyList` | 新的依赖项数组 |

#### **返回值：**

- `boolean`：两数组长度一致且每一项都通过 `===` 判断为相等则返回 `true`，否则返回 `false`。

> 注意差异：该实现与 React 内部使用的 `Object.is` 略有不同——
>
> - `NaN`：此处会判为**不相等**（返回 `false`）；`Object.is(NaN, NaN)` 为 `true`。
> - `0` 与 `-0`：此处判为**相等**；`Object.is(0, -0)` 为 `false`。
>    如需与 React 依赖比较完全一致，请改用 `Object.is`。

---

## 🔤 字符串模板构建 (`string`)

### 🔸 templateBuilder

> **说明**：用于安全、可扩展地构建字符串模板。
>  支持 **数字占位符**（`${0}`）、**命名占位符**（`${name}`）、**缺省值策略**（`error | empty | keep`）、**自定义转换器**（如 HTML 转义）、**预编译模板**（提高高频渲染性能）以及 **链式 Builder API**（`add / conditional / when / addWith / reset`）。

**适用场景：**

- 多条件片段拼接（日志、文案、通知消息、SQL/命令片段）
- 含用户输入的 HTML 片段（仅对占位符值做转义，保留模板结构）
- 高频重复渲染（列表项、缓存片段）
- DSL/模版语言替代的轻量方案

------

#### ✅ 核心能力一览

- 占位符：`${0}`（数组） / `${name}`（对象）
- 缺省策略：
  - `error`：缺值抛错（默认，开发期更容易暴露问题）
  - `empty`：缺值替换为空串
  - `keep`：缺值保留占位符文本
- 转换器 `transform(value)`：仅处理**占位符的值**（如 HTML 转义）
- 预编译 `compileTemplate(template)`：避免重复解析正则，提升性能
- 链式 Builder：`add / addWith / conditional / when / pushRaw / reset / build`

------

#### 使用示例

```ts
import {
  TemplateBuilder,
  interpolate,
  compileTemplate,
  escapeHTML,
} from '@gpx/common-funcraft';

// 1) 单次插值：数字占位符（数组）
interpolate('Hello ${0}, you are ${1}', ['Alice', 30]);
// => "Hello Alice, you are 30"

// 2) 单次插值：命名占位符（对象）
interpolate('User=${name}, Age=${age}', { name: 'Bob', age: 25 });
// => "User=Bob, Age=25"

// 3) 缺省值策略
interpolate('X=${0}, Y=${1}', ['A'], { onMissing: 'keep' });
// => "X=A, Y=${1}"

// 4) 仅对占位符值做 HTML 转义（推荐做法）
interpolate('<b>${name}</b>', { name: '<Tom & Jerry>' }, {
  transform: (v) => escapeHTML(String(v ?? '')),
});
// => "<b>&lt;Tom &amp; Jerry&gt;</b>"  （模板标签保留，值被安全转义）

// 5) 预编译（高频渲染）
const renderItem = compileTemplate('ID=${id}, Name=${name}');
renderItem({ id: 1, name: 'A' }); // => "ID=1, Name=A"
renderItem({ id: 2, name: 'B' }); // 复用解析结果

// 6) Builder：链式拼接
const b = new TemplateBuilder();
b.add('Hello ${name}', { name: 'Carol' })
 .conditional(true, ', age=${0}', 22)
 .pushRaw('!')
 .build();
// => "Hello Carol, age=22!"

// 7) Builder：when（批量条件逻辑）
const user = { name: 'Dave', isAdmin: true, bio: '<coder>' };
new TemplateBuilder({
  transform: (v) => escapeHTML(String(v ?? '')),
})
  .add('Hi ${name}', { name: user.name })
  .when(user.isAdmin, (bb) => bb.pushRaw(' (Admin)'))
  .when(user.bio, (bb, bio) => bb.add(' - ${bio}', { bio }))
  .build();
// => "Hi Dave (Admin) - &lt;coder&gt;"
```

------

#### API

##### `interpolate(template, values, options?) => string`

- **说明**：对一次模板进行插值渲染。`values` 为 `unknown[]`（数字占位）或 `Record<string, unknown>`（命名占位）。
- **参数**
  - `template: string` 模板字符串（包含 `${...}` 占位符）
  - `values: unknown[] | Record<string, unknown>`
  - `options?: { onMissing?: 'error'|'empty'|'keep'; transform?: (v)=>string }`
- **返回**：渲染后的字符串
- **特性**：只对**占位符的值**应用 `transform`；模板静态文本不变。

##### `compileTemplate(template, baseOptions?) => (values, overrideOptions?) => string`

- **说明**：预编译模板，返回可复用的渲染函数。适合高频调用的场景。
- **选项优先级**：调用期的 `overrideOptions` 会覆盖 `baseOptions`。
- **错误信息**：缺值抛错时包含原始模板片段，便于定位。

##### `escapeHTML(text) => string`

- **说明**：最小必要字符的 HTML 转义（`& < > " '`）。常与 `transform` 搭配。

##### `new TemplateBuilder(options?)`

- **默认选项**：`{ onMissing: 'error', transform: (v) => (v == null ? '' : String(v)) }`

##### `add(template, ...values) / add(template, namedValues)`

- 数组重载：`add('Hi ${0}', 'World')`
- 对象重载：`add('Hi ${name}', { name: 'World' })`

##### `addWith(template, values, options?)`

- 对**单段**临时覆盖策略/转换器：

  ```ts
  builder.addWith('<p>${text}</p>', { text: '<b>&</b>' }, {
    transform: (v) => escapeHTML(String(v ?? '')),
  });
  ```

##### `conditional(condition, template, values...)`

- `true` 才会添加该段。

##### `when(condition, fn)`

- `condition` 为真时执行闭包，在闭包内可批量 `add/conditional/pushRaw`。

##### `pushRaw(text)`

- 直接拼接原始文本（无占位）。

##### `reset()`

- 清空已添加的所有片段，便于复用同一实例。

##### `build() / toString()`

- 输出最终字符串。`String(builder)` 等价于 `builder.build()`。

##### `setOptions(options) / getOptions()`

- 运行中更新/读取默认选项（影响后续 `add` / `conditional` 等）。

------

#### 类型签名

```ts
type MissingStrategy = 'error' | 'empty' | 'keep';

type InterpolateOptions = {
  onMissing?: MissingStrategy;
  transform?: (value: unknown) => string;
};

type ValueBag = unknown[] | Record<string, unknown>;

function interpolate(template: string, values: ValueBag, options?: InterpolateOptions): string;

function compileTemplate(
  template: string,
  baseOptions?: InterpolateOptions,
): (values: ValueBag, override?: InterpolateOptions) => string;

function escapeHTML(input: string): string;

class TemplateBuilder {
  constructor(options?: InterpolateOptions);
  add(template: string, ...values: unknown[]): this;
  add(template: string, values: Record<string, unknown>): this;
  addWith(template: string, values: ValueBag, options?: InterpolateOptions): this;
  conditional(condition: boolean, template: string, ...values: unknown[]): this;
  conditional(condition: boolean, template: string, values: Record<string, unknown>): this;
  when<T>(condition: T, fn: (builder: this, value: T) => void): this;
  pushRaw(text: string): this;
  reset(): this;
  build(): string;
  toString(): string;
  setOptions(options: InterpolateOptions): this;
  getOptions(): Required<InterpolateOptions>;
}
```

------

#### 使用建议

- **开发期**用 `onMissing: 'error'` 快速暴露缺值问题；
   **生产/容错**可换成 `empty` 或 `keep`。
- 仅对**占位符值**做转义（`transform`），**不要**整体转义模板文本；
   真要“整段转义”，请在上层对最终结果调用一次全局转义函数。
- 高频渲染**一定**用 `compileTemplate` 预编译，避免重复正则解析。
- 模板复杂、条件多时，优先 `when` 封装成块，提高可读性与可维护性。

------

#### 常见误区

- ❌ 认为 `transform` 会转义整个模板
   ✅ 它**只处理占位符的值**。模板中的 `<div>...</div>` 不会被转义或改写。
- ❌ 在“混合占位符”模板中同时传数组与对象给一次 `interpolate`
   ✅ 一次调用只能选择其一；需要混合时建议拆段，用 `builder.add` 多次拼接。

------

#### 版本迁移提示（若你替换已有模板方案）

- 保留 `${...}` 语法，无需引入重量级模板引擎。
- 原字符串拼接处可逐步替换为 `interpolate` 或 `TemplateBuilder`，先小范围试点再覆盖全局。
- 对外显示/日志类内容建议加上统一 `transform`（如 `escapeHTML`）以防注入/乱码。



## 🔗 其他文档索引

- 📌 [React Hook 使用指南](hook.md)
- 🎨 [SCSS 变量 & Mixin 说明](scss.md)
- 📜 [类型声明说明](type.md)
- 📆 [更新日志](../CHANGELOG.md)

---
📌 **更多函数持续更新中，请关注 [CHANGELOG.md](../CHANGELOG.md)。**

返回 [README](../../README.md) 查看完整文档索引。
