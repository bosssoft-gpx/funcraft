---
name: "@gpx/common-funcraft"
description: "Funcraft package knowledge entrypoint."
knowledge_role: "entry"
canonical_manifest: "package.manifest.json"
children:
  - "docs/package/overview.md"
  - "docs/package/architecture.md"
  - "docs/package/exports.md"
  - "docs/package/constraints.md"
  - "docs/package/glossary.md"
  - "docs/recipes/select-entrypoint-by-runtime.md"
  - "docs/recipes/legacy-webpack-vue-safe-import.md"
  - "docs/examples/index.md"
---

# Funcraft 📦

🚀 **@gpx/common-funcraft** 是一个模块化的前端工具库，集成了 **高质量 TypeScript 工具函数、可复用的 React Hook 以及常用类型声明**，帮助开发者更高效地构建现代前端应用。  
⚠️ SCSS 资产已进入兼容保留阶段（deprecated），仅用于旧版本项目过渡，不建议新项目继续采用。

## ✨ 特性

- ✅ **Tree-shaking 友好** —— 按需引入，有效减少打包体积，提升应用性能
- 🎨 **SCSS 变量/Mixins（兼容保留）** —— 仅保留旧版本兼容，不再作为主推荐方案
- 🛠 **实用工具函数** —— 覆盖数值格式化、文件处理、DOM 操作等常见场景
- ⚛️ **可复用的 React Hook** —— 提供 `useStateRef` 等高效状态管理 Hook
- 📜 **完整 TypeScript 类型声明** —— 提供清晰明确的类型定义，改善开发体验
- 🔥 **支持 Node.js & 浏览器端** —— 可广泛用于 Web 和 Node.js 服务端应用

## ⚠️ SCSS 兼容说明（Deprecated）

- SCSS 变量和 mixins 仅作为**兼容旧版本**而保留。
- 新项目请使用新的样式管理方案，不再建议新增对本库 SCSS 资产的依赖。
- 后续版本会逐步收敛 SCSS 相关文档与导出能力，具体请见 package 文档中的 TODO/路线图。

## 📦 导出入口说明（为何存在多个入口）

为兼容部分旧版 webpack Vue 项目（不支持按需导入/Tree-shaking），本库保留了多个导出入口。  
这类项目若直接全量导入根入口，可能将 React hook 相关代码一并打入产物，导致不必要的依赖与体积问题。

推荐：

- Vue/非 React 项目优先使用 `@gpx/common-funcraft/es/utils` 等更窄入口。
- React 项目可按需使用根入口或 Hook 相关能力。

## 📥 安装

你可以使用 pnpm、npm 或 yarn 进行安装：

```sh
# 使用 pnpm
pnpm add @gpx/common-funcraft

# 或使用 npm
npm install --save @gpx/common-funcraft

# 或使用 yarn
yarn add @gpx/common-funcraft
```

## ⚙ 兼容性说明

| 环境             | 最低兼容版本       | 说明                 |
|----------------|--------------|--------------------|
| **CommonJS**   | Node.js v14  | 适用于服务端 Node.js 项目  |
| **ES Module**  | ES5（支持 IE11） | 浏览器端 JavaScript 模块 |
| **React Hook** | React 16.9   | React 项目内使用        |

## **📖 文档索引**

📚 **更多详细内容请参考以下模块文档：**

- 🧭 **[Package 概览](docs/package/overview.md)**
- 🏗 **[Package 架构与边界](docs/package/architecture.md)**
- 🚪 **[导出入口与选型规则](docs/package/exports.md)**
- 🚫 **[约束与反模式](docs/package/constraints.md)**
- 📚 **[术语表](docs/package/glossary.md)**
- 🧪 **[Recipes：入口选择](docs/recipes/select-entrypoint-by-runtime.md)**
- 🧱 **[Recipes：旧版 webpack Vue 安全导入](docs/recipes/legacy-webpack-vue-safe-import.md)**
- 🗂 **[Examples 索引](docs/examples/index.md)**

- 📌 **[React Hook 使用指南](docs/guide/hook.md)**
- 🎨 **[SCSS 变量 & Mixin 说明](docs/guide/scss.md)**
- 🛠 **[工具函数使用指南](docs/guide/function.md)**
- 📜 **[类型声明说明](docs/guide/type.md)**
- 📆 **[更新日志](docs/CHANGELOG.md)**

## 🛣 TODO（构建导出目录重构）

- [ ] 规划并落地 `common/`、`vue/`、`react/` 三类独立构建产物目录。
- [ ] 基于新目录重构 `exports`，将运行时能力与框架能力彻底解耦。
- [ ] 增补迁移文档：旧入口到新入口的映射表与升级步骤。

## 📄 License

本项目采用 [MIT 许可证](LICENSE) 发布，可自由使用、修改和分发。

## 🌟 为什么选择 Funcraft？

- 🚀 模块化设计，按需加载，减少项目体积
- 📦 统一前端工具库，降低开发维护成本
- 🔖 严谨的类型定义，提升项目稳定性
- 💡 实用高效，提升开发效率与开发体验

## 📌 反馈与贡献

如果你有任何问题、建议或想参与贡献，欢迎提交 [Issue](https://github.com/bosssoft-gpx/funcraft/issues)
或 [Pull Request](https://github.com/your-repo/pulls)。

## 📦 相关链接

- [NPM 仓库](https://www.npmjs.com/package/@gpx/common-funcraft)
- [项目仓库](https://github.com/bosssoft-gpx/funcraft)
- [更新日志（CHANGELOG）](docs/CHANGELOG.md)
