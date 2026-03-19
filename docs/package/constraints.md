# Package Constraints

## Must Rules

1. 非 React 或旧版 webpack Vue 项目，默认优先使用 `@gpx/common-funcraft/es/utils`。  
2. SCSS 资产仅用于兼容保留，不新增新能力依赖。  
3. 引入新公开入口时，必须同步更新 `package.manifest.json` 与 `docs/package/exports.md`。  
4. `useScroll` 接入前需做项目内行为验证（其能力仍标注为实验性）。

## Forbidden Import Patterns

- 在旧版 webpack Vue 项目中直接全量导入 `@gpx/common-funcraft`。
- 把 SCSS 导出入口作为新项目主样式方案。
- 绕过已定义入口，依赖不可控内部路径。

## Wrong-Layer Anti-Patterns

- 在 `compatibility assets` 层继续新增业务样式能力。
- 在未区分运行时的情况下，将 Hook/DOM 语义注入纯工具链路。

## Consequences

- 打包体积异常增大，或引入非预期框架依赖。
- 迁移成本累积，后续目录拆分成本被放大。
- AI/人类选型歧义增加，错误入口被持续复制。

## Recommended Alternatives

- 优先按模块家族选入口（utils/react-hooks/compat-assets）。
- 对历史项目使用兼容入口时，明确迁移窗口与退出时间。
- 在设计新能力时，优先面向未来 `common/vue/react` 分目录结构对齐。
