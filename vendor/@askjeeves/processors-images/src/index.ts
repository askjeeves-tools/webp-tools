import type {
	ConversionOptions,
	ConversionResult,
	ProcessorContext,
} from "@askjeeves/conversion-core";
import {
	basename,
	canvasToBlob,
	throwIfAborted,
	userFacingError,
	withConversionError,
} from "@askjeeves/conversion-core";

const MIN_CROP_SIZE = 10;

function loadImage(file: File): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const url = URL.createObjectURL(file);
		const img = new Image();
		img.onload = () => {
			URL.revokeObjectURL(url);
			resolve(img);
		};
		img.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error("Could not load image."));
		};
		img.src = url;
	});
}

function fileExt(format: "png" | "jpeg" | "webp"): string {
	return format === "jpeg" ? "jpg" : format;
}

export async function convertImage(
	file: File,
	target: "png" | "jpeg" | "webp",
	options?: ConversionOptions,
	context?: ProcessorContext,
): Promise<ConversionResult> {
	return withConversionError("image", async () => {
		const img = await loadImage(file);
		throwIfAborted(context?.signal);
		const maxWidth =
			typeof options?.maxWidth === "number" ? options.maxWidth : undefined;
		let width = img.naturalWidth;
		let height = img.naturalHeight;

		if (maxWidth && width > maxWidth) {
			height = Math.round((height * maxWidth) / width);
			width = maxWidth;
		}

		const canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext("2d");
		if (!ctx) throw userFacingError("Canvas not supported.");

		ctx.drawImage(img, 0, 0, width, height);

		const quality =
			typeof options?.quality === "number" ? options.quality : 0.92;

		const mime =
			target === "png"
				? "image/png"
				: target === "webp"
					? "image/webp"
					: "image/jpeg";

		const blob = await canvasToBlob(
			canvas,
			mime,
			target === "png" ? undefined : quality,
		);

		return {
			blob,
			filename: `${basename(file.name)}.${fileExt(target)}`,
			mimeType: mime,
		};
	});
}

export async function compressImage(
	file: File,
	format: "png" | "jpeg" | "webp",
	options?: ConversionOptions,
	context?: ProcessorContext,
): Promise<ConversionResult> {
	const result = await convertImage(
		file,
		format,
		{
			quality: options?.quality ?? 0.75,
			maxWidth: options?.maxWidth,
		},
		context,
	);
	return {
		...result,
		filename: `${basename(file.name)}-compressed.${fileExt(format)}`,
	};
}

export async function imageToBase64(
	file: File,
	_options?: ConversionOptions,
	_context?: ProcessorContext,
): Promise<ConversionResult> {
	return withConversionError("image", async () => {
		const bytes = new Uint8Array(await file.arrayBuffer());
		let binary = "";
		const chunkSize = 0x8000;
		for (let i = 0; i < bytes.length; i += chunkSize) {
			const chunk = bytes.subarray(i, i + chunkSize);
			binary += String.fromCharCode(...chunk);
		}
		const encoded = btoa(binary);
		return {
			blob: new Blob([encoded], { type: "text/plain" }),
			filename: `${basename(file.name)}.base64.txt`,
			mimeType: "text/plain",
		};
	});
}

export async function cropImage(
	file: File,
	format: "png" | "jpeg" | "webp",
	options?: ConversionOptions,
	_context?: ProcessorContext,
): Promise<ConversionResult> {
	return withConversionError("image", async () => {
		const img = await loadImage(file);
		const naturalWidth = img.naturalWidth;
		const naturalHeight = img.naturalHeight;

		const cropX = Math.floor(options?.cropX ?? 0);
		const cropY = Math.floor(options?.cropY ?? 0);
		const cropWidth = Math.floor(options?.cropWidth ?? naturalWidth);
		const cropHeight = Math.floor(options?.cropHeight ?? naturalHeight);

		if (cropWidth < MIN_CROP_SIZE || cropHeight < MIN_CROP_SIZE) {
			throw userFacingError(
				`Crop area must be at least ${MIN_CROP_SIZE}×${MIN_CROP_SIZE} px.`,
			);
		}
		if (
			cropX < 0 ||
			cropY < 0 ||
			cropX + cropWidth > naturalWidth ||
			cropY + cropHeight > naturalHeight
		) {
			throw userFacingError("Crop area is outside the image bounds.");
		}

		const canvas = document.createElement("canvas");
		canvas.width = cropWidth;
		canvas.height = cropHeight;
		const ctx = canvas.getContext("2d");
		if (!ctx) throw userFacingError("Canvas not supported.");

		ctx.drawImage(
			img,
			cropX,
			cropY,
			cropWidth,
			cropHeight,
			0,
			0,
			cropWidth,
			cropHeight,
		);

		const quality =
			typeof options?.quality === "number" ? options.quality : 0.92;
		const mime =
			format === "png"
				? "image/png"
				: format === "webp"
					? "image/webp"
					: "image/jpeg";

		const blob = await canvasToBlob(
			canvas,
			mime,
			format === "png" ? undefined : quality,
		);

		return {
			blob,
			filename: `${basename(file.name)}-cropped.${fileExt(format)}`,
			mimeType: mime,
		};
	});
}

async function imageBytesForPdf(file: File): Promise<{
	bytes: Uint8Array;
	width: number;
	height: number;
	kind: "png" | "jpg";
}> {
	const img = await loadImage(file);
	const canvas = document.createElement("canvas");
	canvas.width = img.naturalWidth;
	canvas.height = img.naturalHeight;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw userFacingError("Canvas not supported.");
	ctx.drawImage(img, 0, 0);

	const lowerName = file.name.toLowerCase();
	if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) {
		const blob = await canvasToBlob(canvas, "image/jpeg", 0.92);
		return {
			bytes: new Uint8Array(await blob.arrayBuffer()),
			width: img.naturalWidth,
			height: img.naturalHeight,
			kind: "jpg",
		};
	}

	const blob = await canvasToBlob(canvas, "image/png");
	return {
		bytes: new Uint8Array(await blob.arrayBuffer()),
		width: img.naturalWidth,
		height: img.naturalHeight,
		kind: "png",
	};
}

export async function imageToPdf(
	file: File,
	_options?: ConversionOptions,
	_context?: ProcessorContext,
): Promise<ConversionResult> {
	return withConversionError("image", async () => {
		const { PDFDocument } = await import("pdf-lib");
		const { bytes, width, height, kind } = await imageBytesForPdf(file);
		const pdf = await PDFDocument.create();
		const image =
			kind === "jpg" ? await pdf.embedJpg(bytes) : await pdf.embedPng(bytes);
		const page = pdf.addPage([width, height]);
		page.drawImage(image, { x: 0, y: 0, width, height });

		const pdfBytes = await pdf.save();
		return {
			blob: new Blob([pdfBytes], { type: "application/pdf" }),
			filename: `${basename(file.name)}.pdf`,
			mimeType: "application/pdf",
		};
	});
}

export async function compressImageBatch(
	files: File[],
	options?: ConversionOptions,
	context?: ProcessorContext,
): Promise<ConversionResult> {
	return withConversionError("image", async () => {
		if (files.length < 2) {
			throw userFacingError("Batch compress requires at least two images.");
		}

		const JSZip = (await import("jszip")).default;
		const zip = new JSZip();

		for (const file of files) {
			throwIfAborted(context?.signal);
			try {
				const lower = file.name.toLowerCase();
				const format = lower.endsWith(".webp")
					? "webp"
					: lower.endsWith(".png")
						? "png"
						: "jpeg";
				const result = await compressImage(file, format, options, context);
				zip.file(result.filename, result.blob);
			} catch {
				throw userFacingError(
					`Could not process ${file.name}. The image may be corrupted.`,
				);
			}
		}

		const zipBlob = await zip.generateAsync({ type: "blob" });
		const basename0 = basename(files[0].name);

		return {
			blob: zipBlob,
			filename: `${basename0}-compressed.zip`,
			mimeType: "application/zip",
		};
	});
}
