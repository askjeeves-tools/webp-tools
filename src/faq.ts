export interface FaqEntry {
	question: string;
	answer: string;
}

export const FAQ_ENTRIES: FaqEntry[] = [
	{
		question: "Is this WebP converter free?",
		answer:
			"Yes. Every conversion is free with no account, watermark, or usage limit.",
	},
	{
		question: "Is this WebP converter secure?",
		answer:
			"Yes. Files are processed locally in your browser. Nothing is uploaded to a server, so your images stay on your device.",
	},
	{
		question: "What formats can I convert WebP to?",
		answer:
			"You can convert WebP to PNG, JPEG, PDF, or Base64 text. You can also crop WebP images, compress a single file, or batch-compress multiple WebPs into a ZIP file.",
	},
	{
		question: "Can I compress or crop WebP images?",
		answer:
			"Yes. Use Compress image for one file, Compress images (batch) for multiple files, or Crop image with the interactive crop box on the preview.",
	},
	{
		question: "Does the converter work on mobile?",
		answer:
			"Yes. It runs in modern mobile browsers that support HTML5 and JavaScript. Very large files may be slower on mobile devices.",
	},
	{
		question: "What is the maximum file size?",
		answer:
			"Each file can be up to about 50 MB. If a file is too large, you will see a clear error message asking you to use a smaller file.",
	},
	{
		question: "Why did my conversion fail?",
		answer:
			"Common causes are a non-WebP file, corrupted image data, exceeding the size limit, or choosing batch compress with only one file. Check the message below the converter for specific guidance, then try again or refresh the page.",
	},
];
