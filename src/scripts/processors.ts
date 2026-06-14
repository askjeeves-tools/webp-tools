import {
	compressImage,
	compressImageBatch,
	convertImage,
	cropImage,
	imageToBase64,
	imageToPdf,
} from "@askjeeves/processors-images";
import type { ProcessorMap } from "@askjeeves/ui/scripts/tool-controller";

export const processors: ProcessorMap = {
	"webp-png": (file, options) => convertImage(file, "png", options),
	"webp-jpeg": (file, options) => convertImage(file, "jpeg", options),
	"webp-to-pdf": imageToPdf,
	"webp-to-base64": imageToBase64,
	"webp-crop": (file, options) => cropImage(file, "webp", options),
	"webp-compress": (file, options) => compressImage(file, "webp", options),
	"webp-compress-batch": compressImageBatch,
};
