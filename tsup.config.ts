import { defineConfig } from "tsup";
import * as fs from "fs-extra";

const TS_CODE_ENTRY = ["src/**/*.ts", "!src/types/**/*.ts"];
const DTS_CODE_ENTRY = ["src/types/**/*.ts"];

export default defineConfig([
    // ESM 产物
    {
        entry: TS_CODE_ENTRY,
        format: "esm",
        outDir: "es",
        splitting: false,
        bundle: false,
        clean: true,
        treeshake: true,
        target: 'es5',
        external: ['react'],
        outExtension: () => ({ js: '.js' }),
        onSuccess: () => fs.copy("src/styles", "es/styles"),
    },
    // CJS 产物
    {
        entry: TS_CODE_ENTRY,
        format: "cjs",
        outDir: "lib",
        bundle: false,
        clean: true,
        treeshake: true,
        target: 'es5',
        external: ['react']
    },
    // 生成 `src/` 代码的 `.d.ts`
    {
        entry: TS_CODE_ENTRY,
        outDir: "types",
        format: "esm",
        dts: { only: true },
        clean: true,
        treeshake: true,
        external: ['react']
    },
    // 复制 `src/types/` 目录到 `types/`
    {
        entry: DTS_CODE_ENTRY,
        outDir: "types",
        format: "esm",
        dts: { only: true },
        clean: true,
        treeshake: true,
        external: ['axios']
    },
]);
