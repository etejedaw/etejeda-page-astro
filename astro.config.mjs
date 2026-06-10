// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
	site: "https://etejeda.dev",
	integrations: [sitemap()],
	fonts: [
		{
			provider: fontProviders.google(),
			name: "Inter",
			cssVariable: "--font-inter",
			weights: [400, 500, 600, 700, 800],
			styles: ["normal"],
			subsets: ["latin"],
			fallbacks: ["sans-serif"]
		},
		{
			provider: fontProviders.google(),
			name: "JetBrains Mono",
			cssVariable: "--font-jetbrains-mono",
			weights: [400, 700],
			styles: ["normal"],
			subsets: ["latin"],
			fallbacks: ["monospace"]
		}
	]
});
