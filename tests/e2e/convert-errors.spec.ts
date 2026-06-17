import { unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "@playwright/test";
import {
	expectConvertPanelVisible,
	expectToolStatusError,
	fixturePath,
} from "./helpers";

test("wrong format upload shows error", async ({ page }) => {
	await page.goto("/");
	const badPath = join(fixturePath(".."), "fake-upload.pdf");
	await writeFile(badPath, "not a real pdf");

	try {
		await page.locator("#tool-file-input").setInputFiles(badPath);
		await expectToolStatusError(page, /WebP|unsupported|accept/i);
		await expectConvertPanelVisible(page, false);
	} finally {
		await unlink(badPath).catch(() => {});
	}
});

test("oversize upload shows error", async ({ page }) => {
	const bigPath = join(fixturePath(".."), "oversize.webp");
	const big = Buffer.alloc(52_428_801, 0x52);

	try {
		await writeFile(bigPath, big);
		await page.goto("/");
		await page.locator("#tool-file-input").setInputFiles(bigPath);
		await expectToolStatusError(page, /too large/i);
	} finally {
		await unlink(bigPath).catch(() => {});
	}
});

test("batch compress with one file shows error", async ({ page }) => {
	await page.goto("/");
	await page.locator("#tool-file-input").setInputFiles(fixturePath("1x1.webp"));
	await expectConvertPanelVisible(page, true);
	await page.getByRole("radio", { name: "Compress images (batch)" }).check();
	await page.locator("#tool-convert-btn").click();
	await expectToolStatusError(page, /at least 2 files/i);
});

test("invalid WebP bytes show sniff error", async ({ page }) => {
	const invalidPath = join(fixturePath(".."), "invalid-content.webp");
	await writeFile(invalidPath, "not a webp file");

	try {
		await page.goto("/");
		await page.locator("#tool-file-input").setInputFiles(invalidPath);
		await expectToolStatusError(page, /valid WebP/i);
		await expectConvertPanelVisible(page, false);
	} finally {
		await unlink(invalidPath).catch(() => {});
	}
});
