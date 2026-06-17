import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const fixturesDir = join(
	dirname(fileURLToPath(import.meta.url)),
	"../tests/fixtures",
);
mkdirSync(fixturesDir, { recursive: true });

async function writeWebp(filename, width, height, color) {
	await sharp({
		create: {
			width,
			height,
			channels: 3,
			background: color,
		},
	})
		.webp()
		.toFile(join(fixturesDir, filename));
}

await writeWebp("1x1.webp", 1, 1, { r: 255, g: 0, b: 0 });
await writeWebp("1x1-alt.webp", 1, 1, { r: 0, g: 128, b: 255 });
await writeWebp("32x32.webp", 32, 32, { r: 0, g: 255, b: 0 });

console.log("Generated tests/fixtures/*.webp");
