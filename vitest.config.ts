import { defineConfig } from "vitest/config";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	test: {
		globals: true,
		coverage: {
			exclude: ["src/index.ts", "src/**/*.test.ts", "**/*.d.ts"],
		},
	},
	plugins: [tsConfigPaths()],
});
