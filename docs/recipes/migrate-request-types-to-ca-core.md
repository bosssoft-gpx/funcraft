---
id: migrate-request-types-to-ca-core
task: 将请求相关类型从 funcraft 迁移到 @gpx/ca-core
entrypoints:
  - "@gpx/ca-core"
applies_to:
  - utility
related_examples:
  - docs/examples/index.md
related_docs:
  - docs/package/exports.md
  - docs/package/constraints.md
  - docs/guide/type.md
---

# Goal

停止把 `funcraft` 作为请求相关类型的公共来源，统一迁移到 `@gpx/ca-core`，消除深路径兼容依赖。

# When To Use

- 项目仍在使用 `ResponseData`、`TRequestFunction`、`TPossibleResponse` 等历史类型。
- 你在代码、文档或脚手架中看到对 `funcraft` 类型的引用。

# Avoid When

- 项目已经完全切换到 `@gpx/ca-core`。
- 你只是想新增一个请求类型定义。

# Preconditions

- 识别当前项目里所有来自 `funcraft` 的请求相关类型。
- 确认 `@gpx/ca-core` 已作为目标依赖源可用。

# Module Selection

- 新代码统一从 `@gpx/ca-core` 导入请求相关类型。
- 不再通过 `funcraft` 根入口、深路径或隐藏产物获取这些类型。

# Integration Placement

- 优先在 API 基建层、请求封装层和共享类型层完成迁移。
- 若有脚手架模板或代码生成模板，也要同步替换导入源。

# Steps

1. 全局检索 `ResponseData`、`TRequestFunction`、`TPossibleResponse` 等历史类型引用。
2. 将导入源替换为 `@gpx/ca-core`。
3. 在请求封装层做一次类型收敛，避免业务层混用新旧来源。
4. 删除对 `funcraft` 深路径类型文件的依赖约定。

# Code Skeleton

```ts
// before
import type { ResponseData, TRequestFunction } from '@gpx/common-funcraft';

// after
import type { ResponseData, TRequestFunction } from '@gpx/ca-core';
```

# Constraints And Anti-Patterns

- 不要新增 `@gpx/common-funcraft/es/types/*` 或 `lib/types/*` 之类的深路径依赖。
- 不要把迁移残留文件重新包装成新的对外标准。
- 不要继续在 README 或示例中暗示 funcraft 仍是稳定类型入口。

# Related Examples / Docs

- [Exports](../package/exports.md)
- [Constraints](../package/constraints.md)
- [Type Guide](../guide/type.md)
- [Examples Index](../examples/index.md)
