const MAX_BYTES = 400_000;

export async function compressImageToDataUrl(
  file: File,
  maxWidth = 800,
  quality = 0.82
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("invalid_type");
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("canvas"));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("load"));
    };

    img.src = objectUrl;
  });

  const bytes = Math.ceil((dataUrl.length * 3) / 4);
  if (bytes > MAX_BYTES) {
    return compressImageToDataUrl(file, maxWidth * 0.75, quality * 0.85);
  }

  return dataUrl;
}
