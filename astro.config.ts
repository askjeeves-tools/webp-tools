import askJeeves from "@askjeeves/astro-integration";
import { defineConfig } from "astro/config";
import pkg from "./package.json" with { type: "json" };

export default defineConfig({
	output: "static",
	site: "https://webp.askjeeves.cc",
	integrations: [
		askJeeves({
			name: "Ask Jeeves",
			tagline:
				"Convert WebP files in your browser. Nothing leaves your device.",
			version: pkg.version,
			openGraph: {
				home: {
					title: "WebP Converter — Ask Jeeves",
					description:
						"Free WebP conversion, compression, and export tools in your browser. No upload.",
				},
			},
		}),
	],
	vite: {
		resolve: {
			preserveSymlinks: true,
		},
		ssr: {
			noExternal: [
				"@askjeeves/conversion-core",
				"@askjeeves/processors-images",
				"@askjeeves/ui",
			],
		},
	},
});
