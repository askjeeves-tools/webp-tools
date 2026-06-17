import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, type Page } from "@playwright/test";

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), "../fixtures");

export function fixturePath(name: string): string {
	return join(fixturesDir, name);
}

export async function expectToolStatusError(
	page: Page,
	pattern: RegExp,
): Promise<void> {
	const status = page.locator("#tool-status");
	await expect(status).toHaveClass(/error/);
	await expect(status).toHaveText(pattern);
}

export async function expectConvertPanelVisible(
	page: Page,
	visible: boolean,
): Promise<void> {
	const panel = page.locator("#tool-convert-panel");
	if (visible) {
		await expect(panel).not.toHaveClass(/hidden/);
	} else {
		await expect(panel).toHaveClass(/hidden/);
	}
}

export interface WebpConversionCase {
	id: string;
	fixture: string;
	methodLabel?: string;
	extraFixtures?: string[];
}

export async function runWebpConversionCase(
	page: Page,
	testCase: WebpConversionCase,
): Promise<void> {
	const files = [fixturePath(testCase.fixture)];
	if (testCase.extraFixtures) {
		files.push(...testCase.extraFixtures.map((name) => fixturePath(name)));
	}

	await page.locator("#tool-file-input").setInputFiles(files);
	await expectConvertPanelVisible(page, true);

	if (testCase.methodLabel) {
		await page
			.getByRole("radio", { name: testCase.methodLabel, exact: true })
			.check();
	}

	await page.locator("#tool-convert-btn").click();
	await expect(page.locator("#tool-download")).not.toHaveClass(/hidden/);
	await expect(page.locator("#tool-status")).toHaveText(/ready to download/i);
}

export const WEBP_CONVERSION_CASES: WebpConversionCase[] = [
	{ id: "webp-png", fixture: "1x1.webp", methodLabel: "WebP → PNG" },
	{ id: "webp-jpeg", fixture: "1x1.webp", methodLabel: "WebP → JPEG" },
	{ id: "webp-to-pdf", fixture: "1x1.webp", methodLabel: "Convert to PDF" },
	{ id: "webp-to-base64", fixture: "1x1.webp", methodLabel: "Convert to Base64" },
	{ id: "webp-crop", fixture: "32x32.webp", methodLabel: "Crop image" },
	{ id: "webp-compress", fixture: "1x1.webp", methodLabel: "Compress image" },
	{
		id: "webp-compress-batch",
		fixture: "1x1.webp",
		extraFixtures: ["1x1-alt.webp"],
		methodLabel: "Compress images (batch)",
	},
];
