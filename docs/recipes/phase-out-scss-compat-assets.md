---
id: phase-out-scss-compat-assets
task: 退出 funcraft 的 SCSS 兼容资产
entrypoints:
  - "@gpx/common-funcraft/es/styles/variables"
applies_to:
  - utility
related_examples:
  - docs/examples/index.md
related_docs:
  - docs/package/exports.md
  - docs/package/constraints.md
  - docs/guide/scss.md
---

# Goal

把历史项目对 `funcraft` SCSS 变量与 mixins 的依赖收敛为一次明确的迁移动作，而不是继续把它当作长期公共能力面。

# When To Use

- 项目仍保留 `funcraft` 的 SCSS 变量或 mixins 依赖。
- 你需要评估这些依赖能否迁移到新的样式方案。

# Avoid When

- 新项目或已经完成样式迁移的项目。
- 你只是想新增一段样式能力。

# Preconditions

- 识别出当前项目对 SCSS 变量 / mixins 的真实引用点。
- 团队已接受该能力属于 compat-only，不再长期扩展。
- 明确当前发布产物不应被假设为稳定 SCSS dist。

# Module Selection

- 不新增任何新的 `funcraft` SCSS 入口依赖。
- 仓库内迁移盘点时，以 `src/styles/variables.scss` 与 `src/styles/mixins.scss` 为事实来源。

# Integration Placement

- 在项目样式基建层统一做迁移，不要让业务样式分散保留多个历史导入策略。

# Steps

1. 全局检索历史 SCSS 导入语句和 mixin 使用点。
2. 按变量、mixin、临时兼容 hack 分类形成清单。
3. 将可替换能力迁移到新的样式方案或本地样式基建。
4. 对不能立即迁移的残留点记录退出窗口，不再新增新的引用。

# Code Skeleton

```scss
// before
@use "@gpx/common-funcraft/es/styles/variables" as *;
@use "@gpx/common-funcraft/es/styles/mixins" as mixins;

.panel {
  @include mixins.full-content;
  color: $c-primary;
}

// after
@use "../theme/tokens" as *;
@use "../theme/mixins" as mixins;
```

# Constraints And Anti-Patterns

- 不要把 `docs/guide/scss.md` 当作“当前 npm 包保证可用”的接入手册。
- 不要新增对 `@gpx/common-funcraft/es/styles/mixins` 的依赖。
- 不要在兼容层继续新增业务样式能力。

# Related Examples / Docs

- [Exports](../package/exports.md)
- [Constraints](../package/constraints.md)
- [SCSS Guide](../guide/scss.md)
- [Examples Index](../examples/index.md)
