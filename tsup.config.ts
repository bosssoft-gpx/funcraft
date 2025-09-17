import { defineConfig } from "tsup";

const commonConfig = {
    entry: ["src/**/*.ts"],
    treeshake: true,
    target: 'es5',
    external: ['react'],
    clean: true,
};

export default defineConfig([
    // ESM 产物
    {
        ...commonConfig,
        format: "esm",
        outDir: "es",
        splitting: false,
        bundle: false,
        outExtension: () => ({ js: '.js' }),
    },
    // CJS 产物
    {
        ...commonConfig,
        format: "cjs",
        outDir: "lib",
        bundle: false,
    },
    // 生成 `src/` 代码的 `.d.ts`
    {
        ...commonConfig,
        outDir: "types",
        dts: { only: true },
    },
]);
