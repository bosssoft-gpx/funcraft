import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
	plugins: [
		react(),  // 支持 React 16.9
	],
	test: {
		environment: 'jsdom',
		setupFiles: ['./test/setup.ts'],
		globals: true,
		css: false,
		include: ['test/**/*.{test,spec}.{ts,tsx}', 'src/**/*.{test,spec}.{ts,tsx}'],
		coverage: {
			reporter: ['text', 'json', 'html'], // 控制台 + CI 支持 + 可视化 HTML
			reportsDirectory: './coverage',
			exclude: ['./test/setup.ts', "vitest.config.ts"],
		},
	},
	resolve: {
		alias: {
			src: path.resolve(__dirname, 'src'),
		},
	},
});
