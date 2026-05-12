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
| `@gpx/common-funcraft/es/styles/variables` | 历史样式迁移盘点 | 任何依赖稳定 npm dist 的场景 | 已 deprecated，且当前发布产物未提供稳定 SCSS dist |

## 未公开但容易被误判的能力面

以下能力在源码或构建目录中仍能看到痕迹，但**不应视为正式公共入口**：

| 能力面 | 当前状态 | 正确做法 |
|---|---|---|
| 请求相关类型（`ResponseData` 等） | 已迁移到 `@gpx/ca-core`，本包无稳定导出入口 | 新项目直接使用 `@gpx/ca-core`；旧项目按迁移 recipe 收口 |
| `es/styles/mixins` | 文档曾引用，但 `exports` 未声明且 dist 未发布 | 不要新接入；仅在仓库内对照 `src/styles/*` 做迁移盘点 |

## 当前已知限制

- 样式导出目前不仅是兼容态，而且当前 dist 并未提供稳定可消费的 SCSS 文件。
- 请求相关类型仍有源码残留，但没有正式 public export，不应依赖深路径。
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
- [Recipe: Integrate React Hooks In React Runtime](../recipes/integrate-react-hooks-in-react-runtime.md)
- [Recipe: Phase Out SCSS Compat Assets](../recipes/phase-out-scss-compat-assets.md)
- [Recipe: Migrate Request Types To ca-core](../recipes/migrate-request-types-to-ca-core.md)
