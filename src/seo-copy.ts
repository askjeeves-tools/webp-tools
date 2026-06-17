export const HOW_IT_WORKS_STEPS = [
	"Upload one or more WebP files using the drop zone or file picker.",
	"Choose an output format or action (compress, crop, batch, and more).",
	"Click Convert, then download your result. Nothing is uploaded to a server.",
] as const;

export const SECURITY_SECTION_COPY =
	"Your files are processed locally in your browser. Nothing is stored on a server and nothing is uploaded over the network. That makes this tool a good fit for screenshots, documents, and other sensitive images you do not want to send to a third-party service.";

export const CONVERSION_DESCRIPTIONS: Record<string, string> = {
	"webp-png":
		"Convert WebP to PNG with lossless output for editing or compatibility.",
	"webp-jpeg": "Convert WebP to JPEG with adjustable quality and optional max width.",
	"webp-to-pdf": "Turn a WebP image into a single-page PDF document.",
	"webp-to-base64": "Export WebP as Base64 text for code or API embedding.",
	"webp-crop": "Crop a WebP using an interactive preview box.",
	"webp-compress": "Reduce WebP file size with a quality slider.",
	"webp-compress-batch":
		"Compress multiple WebP files and download them as a ZIP file.",
};
