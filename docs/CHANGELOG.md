# 📦 更新日志

该项目的更新日志遵循 Keep a Changelog 格式，并遵循 语义化版本控制 规范。

---

## [0.2.0] - 2025-09-17

### ✨ 新增

- **Hook: `useReactiveRef`**
  - 创建一个响应式的 `ref`，用于在闭包中获取最新的 prop 值，避免 stale closure 问题

### 📝 文档
- 新增 **`useReactiveRef`** 使用文档：API、参数说明、示例、注意事项。

### ❗ 移除
- 移除包含 `ResponseData` 在内的请求相关类型声明定义导出，其迁移至 [`@gpx/ca-core`](http://192.168.8.48/yangjunhao/ca-core) 维护

### 🛠 变更
- 调整项目构建配置，`types` 产物调整为 dts 文件，提升类型声明的准确性

---

## [0.1.5-beta.0] - 2025-08-28

### ✨ 新增

- **Hook：`useEffectWithTarget`**
  - 将副作用绑定到特定目标（`Element` / `Document` / `Window` 或函数、`ref`）；
  - 依赖或目标变化时自动清理并重绑；
  - 支持目标数组绑定。
- **Hook（实验性）：`useScroll`**
  - 监听并控制滚动，返回 `position`、`isTop/isBottom/isLeft/isRight`；
  - 提供 `scrollTo` / `scrollToTop` / `scrollToBottom` 等方法；
  - 支持 `Window` / `Document` / 普通元素 / **同源 `iframe`**；
  - `shouldUpdate` 用于像素阈值/节流控制；`deps` 用于显式重绑。
- **工具函数**
  - `canAccessIFrame(iframe)`：判断 `iframe` 是否同源可访问；
  - `getTargetElement(target, defaultElement?)`：统一解析目标对象（值/函数/`ref`）；
  - `depsAreSame(oldDeps, deps)`：浅比较依赖数组是否等值；
  - `getScrollTopForChild(container, child)`：计算容器滚到子元素顶部所需的 `scrollTop`（基于 `getBoundingClientRect`，对复杂布局更稳）。
- **导出**
  - 对外导出上述 Hook 与工具函数。

### 📝 文档

- 新增 **`useEffectWithTarget`** 使用文档：API、参数说明、单/多目标示例、注意事项。
- 新增 **`useScroll`（实验性）** 使用文档：
  - 明确实验性标注：初始化阶段可能出现“一帧多次回调”；水平滚动 API 暂未实现；
  - 覆盖页面与元素容器、同源 `iframe`、`deps` 触发重绑等示例；
  - 解释事件绑定与边界判断策略。
- 新增四个工具函数的**独立说明文档**：
  - `canAccessIFrame` / `getTargetElement` / `depsAreSame` / `getScrollTopForChild`（含函数签名、参数与返回值说明）。

### ✅ 测试

- 新增 **Vitest** 单元测试：
  - `canAccessIFrame`：同源返回 `true`；跨域访问抛错时返回 `false`；
  - `getTargetElement`：覆盖值/函数/`ref`/兜底分支；
  - `depsAreSame`：等值、长度不同、`NaN`、对象引用不同等用例；
  - `getScrollTopForChild`：页面与元素容器两类坐标计算。
- 新增/完善 **JSDOM 环境与测试前置**（示例）：
  - `environment: 'jsdom'`、`setupFiles`；
  - `ResizeObserver`、`pageXOffset/pageYOffset`、`DOMRect` 等必要 polyfill；
  - 提示在需要时 mock `wrapperRaf` 以稳定回调时序断言。
- 新增 **`useEffectWithTarget`** 行为测试：首次执行、依赖变化、目标变化（值/`ref`/函数）、目标数组变化、不变时不重复执行、卸载清理。

### 🛠 变更

- **`useScroll` 实现细化**（向后兼容）：
  - 文档/窗口滚动与尺寸监听统一绑定在 **`window`**；
  - 支持**同源 `iframe`** 的 `contentWindow` 监听；**跨域**打印警告并跳过绑定；
  - 元素尺寸变化优先使用 **`ResizeObserver`**，旧环境降级 `window.resize`；
  - 底/右边界判断加入 **1px 容差**，降低缩放与浮点误差影响；
  - `scrollTo(子元素)` 改为使用 **`getBoundingClientRect` 差值** 计算，替代 `offsetTop`，在复杂布局下更稳。

### ⚠️ 已知限制（实验性说明）

- `useScroll` 初始化阶段可能触发 **≥1 次** `onScroll` 回调（位置与尺寸更新各一次）；
- `scrollToLeft` / `scrollToRight` **尚未实现**（当前仅输出告警）；
- 若目标容器会在生命周期内被替换，请通过 `options.deps` **显式触发重绑**。

---

## [0.1.4-beta.0] - 2025-08-14

### ✨ 新增

新增 模板字符串构建工具 TemplateBuilder 及相关方法：

支持 数字占位符（${0}）和 命名占位符（${name}）两种插值模式；

支持缺省值策略：error（缺值抛错）、empty（缺值置空）、keep（保留占位符）；

支持 transform 转换器，仅处理占位符值，可用于 HTML 转义、格式化等场景；

支持 compileTemplate 预编译模板，提高高频渲染性能；

支持链式 API：add / addWith / conditional / when / pushRaw / reset / build；

提供 escapeHTML 工具函数，方便在 transform 中做安全处理；

类型安全，兼容数组与对象值输入，支持泛型推导；

纯函数与可链式调用设计，不修改原始数据，便于组合与复用；

已提供详细文档与完整 Vitest 测试用例。

---

## [0.1.3-beta.0] - 2025-06-14

### ✨ 新增

`formatFileSize` 函数拓展“省略小数位”的选项: `{options: { omitDecimal: true }}`，用于格式化文件大小时省略小数位。

同时为其提供了完整 Vitest 测试用例。

---

## [0.1.2-beta.0] - 2025-06-11

### ✨ 新增

新增工具函数 omit(obj, fields)：

支持从对象中排除一个或多个字段，返回新对象；

保持类型安全，支持泛型推导；

支持只读字段数组作为输入；

遵循纯函数设计，原对象不会被修改；

已提供完整的文档与 Vitest 测试用例。

