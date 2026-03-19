---
id: select-entrypoint-by-runtime
task: 按运行时选择正确导出入口
entrypoints:
  - "@gpx/common-funcraft"
  - "@gpx/common-funcraft/es/utils"
  - "@gpx/common-funcraft/es/styles/variables"
applies_to:
  - utility
related_examples:
  - docs/examples/index.md
related_docs:
  - docs/package/exports.md
  - docs/package/constraints.md
---

# Goal

在不同项目类型中选择最合适的入口，避免框架误导入与不必要打包体积。

# When To Use

- 新项目接入本包前。
- 旧项目排查“为什么打包进了不该有的模块”时。
- 准备做入口迁移或构建升级时。

# Avoid When

- 你已经有固定入口且经过构建验证，不需要变更时。

# Preconditions

- 明确项目是否为 React 项目。
- 明确构建是否支持按需导入 / Tree-shaking。
- 明确是否处于历史 SCSS 兼容窗口。

# Module Selection

- React + 可 Tree-shaking：可使用 `@gpx/common-funcraft`。
- Vue/非 React 或旧构建工具链：优先 `@gpx/common-funcraft/es/utils`。
- SCSS：仅兼容场景使用 `@gpx/common-funcraft/es/styles/variables`。

# Integration Placement

- 入口选择策略应放在项目脚手架约定或依赖接入文档中。
- 不要在业务组件里随意混用不同入口。

# Steps

1. 识别项目运行时（React/Vue/其他）与构建能力。
2. 根据 `docs/package/exports.md` 选择入口。
3. 在主分支进行一次打包体积/依赖检查。
4. 固化到团队接入规范，避免回归误用。

# Code Skeleton

```ts
// React 项目（支持 Tree-shaking）
import { useEvent, formatNumber } from '@gpx/common-funcraft';

// Vue 或旧版 webpack 项目
import { formatNumber, omit } from '@gpx/common-funcraft/es/utils';
```

# Variants

- 若项目处于迁移期：先从根入口收敛到 `es/utils`，再逐步替换内部调用路径。
- 若仅历史样式依赖：保留 SCSS 入口并规划退出时间。

# Constraints And Anti-Patterns

- 禁止在旧版 webpack Vue 项目中默认全量导入根入口。
- 禁止把 SCSS 兼容入口作为新能力的长期基础。

# Related Examples / Docs

- [Exports](../package/exports.md)
- [Constraints](../package/constraints.md)
- [Examples Index](../examples/index.md)
