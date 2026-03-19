# Package Overview

## 定位

`@gpx/common-funcraft` 是一个 `utility` archetype 的前端公共能力包，面向以下三类能力：

- 通用工具函数（utils）
- React Hook（react-hooks）
- 兼容保留资产（scss-assets，已弃用）

## Problem Space

它解决的问题：

- 统一常见工具函数实现与类型约束
- 复用 React 状态与滚动等 Hook 逻辑
- 给历史项目提供有限的向后兼容能力

它不解决的问题：

- 不承担完整 UI 组件系统职责
- 不作为新项目的样式体系主入口

## Module Families

| Family | 说明 | 推荐入口 |
|---|---|---|
| `utils` | 通用函数能力 | `@gpx/common-funcraft/es/utils` |
| `react-hooks` | React Hook 能力 | `@gpx/common-funcraft` |
| `scss-assets` | SCSS 兼容资产（deprecated） | `@gpx/common-funcraft/es/styles/variables`（仅兼容） |

## 关键声明

1. SCSS 已标记为弃用（deprecated），仅为旧版本兼容保留。  
2. 多入口是有意设计：用于规避旧版 webpack Vue 项目全包导入时将 React Hook 一并打包的问题。  
3. 后续将推进分目录构建（`common/`、`vue/`、`react/`）来彻底隔离不同运行时能力。

## Read Next

- [Package Architecture](architecture.md)
- [Exports Guide](exports.md)
- [Constraints](constraints.md)
- [EntryPoint Selection Recipe](../recipes/select-entrypoint-by-runtime.md)
