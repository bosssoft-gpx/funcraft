# Package Architecture

## Intent

明确 `funcraft` 的包级边界：按模块家族暴露能力，避免跨框架误导入，提升旧项目兼容性与新项目可选型性。

## Layers

### Layer: public surface

- 职责：统一入口与导出语义（`src/index.ts`、`src/utils/index.ts`、`src/hook/index.ts`）。
- 允许依赖：对应模块家族的聚合导出。
- 不允许：将兼容层能力伪装成新推荐能力。

### Layer: core capability

- 职责：承载真实业务能力实现（`src/utils/*`、`src/hook/*`）。
- 允许依赖：同层必要复用（例如 hook 对 utils 的调用）。
- 不允许：引入与能力无关的框架耦合。

### Layer: compatibility assets

- 职责：承载历史兼容资产（`src/styles/*`）。
- 允许依赖：仅兼容维护需要。
- 不允许：新增功能继续绑定到该层。

## Boundaries

- Vue/非 React 项目应优先走 `es/utils` 子入口，避免根入口引入 React Hook 语义。
- 根入口适用于支持 Tree-shaking 的 React 场景，不应视为所有项目默认入口。
- SCSS 资产仅兼容保留，不应继续扩展。

违反后果：

- 旧版 webpack Vue 项目可能把 React Hook 相关代码错误打入产物。
- 新增样式能力继续堆积在 SCSS 兼容层会放大后续迁移成本。

## Extension Points

- 新增 `utils`：在 `src/utils/*` 实现并在 `src/utils/index.ts` 聚合。
- 新增 `react-hooks`：在 `src/hook/*` 实现并在 `src/hook/index.ts` 聚合。
- 新入口策略：先更新 `package.manifest.json` 与 `docs/package/exports.md` 再改构建导出。

## Sanctioned Composition Paths

- React 场景：`@gpx/common-funcraft`（必要时再按文档收敛到子入口）。
- Vue/旧构建场景：`@gpx/common-funcraft/es/utils`。
- 历史样式兼容场景：仅临时使用 `es/styles/variables`，并规划迁移。

## Forbidden Paths

- 旧版 webpack Vue 项目直接全量导入根入口。
- 把 SCSS 兼容层当作长期演进主路径。
- 未经文档同步直接新增面向外部的导出入口。

## Runtime / Provider / SSR Notes

- 本包不是 provider 驱动型框架，无强制 provider/SSR 协议。
- 主要风险来自入口选择与构建环境差异，而非运行时生命周期模型。
