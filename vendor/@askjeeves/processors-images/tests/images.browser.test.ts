/** @vitest-environment happy-dom */

import { UserFacingError } from "@askjeeves/conversion-core";
import { loadFixtureFile } from "@askjeeves/test-e2e/fixtures";
import { describe, expect, it } from "vitest";
import { compressImageBatch, imageToBase64 } from "../src/index";

describe("image processors", () => {
	it("imageToBase64 encodes file", async () => {
		const file = await loadFixtureFile("1x1.png");
		const result = await imageToBase64(file);
		const text = await result.blob.text();
		expect(text.length).toBeGreaterThan(0);
		expect(result.filename).toContain(".base64.txt");
	});

	it("compressImageBatch rejects single file", async () => {
		const file = await loadFixtureFile("1x1.png");
		await expect(compressImageBatch([file])).rejects.toThrow(UserFacingError);
	});
});
