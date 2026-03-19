---
id: legacy-webpack-vue-safe-import
task: 在旧版 webpack Vue 项目中安全接入 funcraft
entrypoints:
  - "@gpx/common-funcraft/es/utils"
applies_to:
  - utility
related_examples:
  - docs/examples/index.md
related_docs:
  - docs/package/exports.md
  - docs/package/constraints.md
---

# Goal

在不支持按需导入/Tree-shaking 的旧版 webpack Vue 项目中，避免误打包 React Hook 相关代码。

# When To Use

- Vue 2 或历史 webpack 项目。
- 构建链路中无法保证 ESM Tree-shaking。

# Avoid When

- 已完成构建升级并可稳定按需打包的项目。

# Preconditions

- 确认项目并不需要本包的 React Hook。
- 确认能改动导入语句并完成一次打包验证。

# Module Selection

- 只导入 `@gpx/common-funcraft/es/utils`。
- 不使用根入口 `@gpx/common-funcraft`。

# Integration Placement

- 统一放在项目公共 utils 层或 API 适配层。
- 不要在各页面内分散定义“临时导入策略”。

# Steps

1. 全局检索 `@gpx/common-funcraft` 根入口导入。
2. 对非 React 使用场景替换为 `@gpx/common-funcraft/es/utils`。
3. 执行构建并检查产物依赖差异。
4. 在项目规范中固化导入规则。

# Code Skeleton

```ts
// before
import { formatNumber, useEvent } from '@gpx/common-funcraft';

// after (Vue/legacy webpack)
import { formatNumber } from '@gpx/common-funcraft/es/utils';
```

# Variants

- 若存在历史 SCSS 兼容需求，可单独保留 `es/styles/variables` 导入，但应记录迁移计划。

# Constraints And Anti-Patterns

- 不要在同一模块同时混用根入口和 utils 子入口。
- 不要把“兼容导入”误解为长期最佳实践，后续应迁移到新构建目录策略（common/vue/react）。

# Related Examples / Docs

- [Exports](../package/exports.md)
- [Constraints](../package/constraints.md)
- [Overview](../package/overview.md)
