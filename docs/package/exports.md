# Package Exports

## 为什么有多个导出入口

多入口是有意设计，不是临时冗余：

- 某些旧版 webpack Vue 项目不支持按需导入 / Tree-shaking。
- 这类项目若直接全量导入根入口，可能把 React Hook 相关代码一并打包。
- 因此保留更窄的子入口（例如 `es/utils`）用于隔离框架耦合。

## 入口选择表

| 入口 | 适用场景 | 不建议场景 | 备注 |
|---|---|---|---|
| `@gpx/common-funcraft` | React 项目，且构建可正确 Tree-shaking | 旧版 webpack Vue 项目 | 根入口聚合 `hook + utils` |
| `@gpx/common-funcraft/es/utils` | Vue/非 React 项目；旧构建工具链 | 需要 Hook 能力时 | 推荐作为“低耦合入口” |
| `@gpx/common-funcraft/es/styles/variables` | 历史样式兼容 | 新项目样式建设 | 已 deprecated，compat-only |

## 当前已知限制

- 样式导出目前仅用于兼容，不保证作为长期稳定主能力面。
- `useScroll` 属于实验性能力，接入前建议先做回归验证。

## TODO：构建导出目录重构

为进一步降低跨环境误导入风险，计划推进以下改造：

- [ ] 构建产物拆分为 `common/`、`vue/`、`react/` 三类目录。
- [ ] `exports` 与目录一一对应，明确每个目录的目标运行时。
- [ ] 提供旧入口到新入口迁移映射与升级步骤。

## 相关文档

- [Package Overview](overview.md)
- [Constraints](constraints.md)
- [Recipe: Select EntryPoint By Runtime](../recipes/select-entrypoint-by-runtime.md)
- [Recipe: Legacy Webpack Vue Safe Import](../recipes/legacy-webpack-vue-safe-import.md)
