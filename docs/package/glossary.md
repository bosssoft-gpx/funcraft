# Package Glossary

## Root EntryPoint

`@gpx/common-funcraft`。默认聚合 `utils + react-hooks` 的根入口。

## Subpath EntryPoint

按模块家族细分的导出入口，例如 `@gpx/common-funcraft/es/utils`。

## Legacy Webpack Vue Project

不支持按需导入或 Tree-shaking 的旧版 webpack Vue 项目。此类项目更容易出现全包导入副作用。

## Compatibility-Only Asset

仅用于历史兼容，不再推荐新增依赖的资产。当前主要指本包 SCSS 变量与 mixins。

## Module Family

按能力聚合的模块分组，例如 `utils`、`react-hooks`、`scss-assets`。

## Forbidden Import Pattern

已明确禁止的导入方式。例如：旧版 webpack Vue 项目直接导入根入口。

## Progressive Disclosure

渐进式阅读策略：先读入口文档与 manifest，再按任务扩展到 exports/constraints/recipes，避免全量扫描。
