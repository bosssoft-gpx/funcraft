# Examples Index

当前仓库暂无独立 `examples/` 目录，本索引用于把 `guide` 中的可执行示例与任务型 recipe 关联起来。

## By Capability

| Capability | Example Source | Related Recipe |
|---|---|---|
| React Hook: `useScroll` | `docs/guide/hook.md` | `docs/recipes/select-entrypoint-by-runtime.md` |
| React Hook: `useMergedState` / `useSafeState` | `docs/guide/hook.md` | `docs/recipes/select-entrypoint-by-runtime.md` |
| Utils: `templateBuilder` | `docs/guide/function.md` | `docs/recipes/select-entrypoint-by-runtime.md` |
| Utils: `formatFileSize` / `omit` / `safeErrorWrapper` | `docs/guide/function.md` | `docs/recipes/legacy-webpack-vue-safe-import.md` |
| SCSS 变量与 mixins（兼容保留） | `docs/guide/scss.md` | `docs/recipes/legacy-webpack-vue-safe-import.md` |

## Notes

- SCSS 示例仅用于历史兼容，不建议作为新项目实践。
- 后续若新增真实 `examples/` 或 `docs/demos/`，请在本索引追加映射并同步 `package.manifest.json`。
