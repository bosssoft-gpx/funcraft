---
id: integrate-react-hooks-in-react-runtime
task: 在 React 运行时中接入 funcraft Hook
entrypoints:
  - "@gpx/common-funcraft"
applies_to:
  - utility
related_examples:
  - docs/examples/index.md
related_docs:
  - docs/package/exports.md
  - docs/package/constraints.md
  - docs/guide/hook.md
---

# Goal

在 React 项目中使用 `funcraft` 的 Hook 能力，同时避免把根入口误扩散到非 React 或旧构建场景。

# When To Use

- React 项目需要使用 `useStateRef`、`useEvent`、`useMergedState` 或 `useScroll`。
- 构建链路明确支持按需导入 / Tree-shaking。

# Avoid When

- Vue、非 React 或旧版 webpack 项目。
- 仅需要 utils 能力时。

# Preconditions

- 项目运行时为 React。
- 团队已接受根入口聚合 `hook + utils` 的语义。
- 若接入 `useScroll`，准备在项目内完成一次行为验证。

# Module Selection

- Hook 能力统一从 `@gpx/common-funcraft` 获取。
- 若同模块只需要 utils，仍可按需改为 `@gpx/common-funcraft/es/utils` 收窄能力面。

# Integration Placement

- 把导入策略固定在组件层或共享 hooks 层，不要在兼容层项目里混用根入口和 utils 子入口。
- 对 `useScroll` 这类实验性能力，建议在接入说明或本地封装层记录行为约束。

# Steps

1. 确认目标模块运行在 React 环境，并允许依赖根入口。
2. 从 `@gpx/common-funcraft` 导入所需 Hook。
3. 若使用 `useScroll`，在目标页面完成滚动、resize、容器替换等回归验证。
4. 若后续发现模块只用到 utils，收敛到 `es/utils` 降低根入口扩散。

# Code Skeleton

```tsx
import { useEvent, useStateRef, useScroll } from '@gpx/common-funcraft';

function Example() {
  const [value, setValue, valueRef] = useStateRef('');
  const onSubmit = useEvent(() => {
    console.log(valueRef.current);
  });

  const { position } = useScroll(document, {
    onScroll(next) {
      console.log(next.top);
    },
  });

  return (
    <button onClick={() => {
      setValue('next');
      onSubmit();
      console.log(position.top);
    }}
    >
      run
    </button>
  );
}
```

# Constraints And Anti-Patterns

- 不要在 Vue/旧版 webpack 项目中沿用该 recipe。
- 不要把 `useScroll` 当作无需验证的稳定基础设施。
- 不要因为使用一个 Hook，就把整个非 React 模块切换到根入口。

# Related Examples / Docs

- [Exports](../package/exports.md)
- [Constraints](../package/constraints.md)
- [Hook Guide](../guide/hook.md)
- [Examples Index](../examples/index.md)
