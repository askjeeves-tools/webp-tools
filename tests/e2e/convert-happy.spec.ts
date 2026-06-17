import { test } from "@playwright/test";
import { WEBP_CONVERSION_CASES, runWebpConversionCase } from "./helpers";

for (const testCase of WEBP_CONVERSION_CASES) {
	test(`converts ${testCase.id}`, async ({ page }) => {
		await page.goto("/");
		await runWebpConversionCase(page, testCase);
	});
}
