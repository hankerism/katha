/* ---------------------------------------------------------------------------
 * KATHA · Author Studio — cover file processing
 * components/studio/cover-file.ts
 *
 * Turns an author's image file into a calm, storable cover: downscaled on a
 * canvas (portrait covers cap at 900px on the long edge) and re-encoded as a
 * JPEG data URL small enough to live happily in localStorage. With storage
 * buckets, this same function becomes "downscale, then upload" and the field
 * it feeds doesn't change. Browser-only by nature.
 * ------------------------------------------------------------------------- */

const MAX_SOURCE_BYTES = 10 * 1024 * 1024; // refuse absurd files early
const MAX_EDGE_PX = 900;
const JPEG_QUALITY = 0.82;

export class CoverFileError extends Error {}

export async function fileToCoverDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new CoverFileError('That file isn’t an image — JPG or PNG works.');
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new CoverFileError(
      'That image is heavier than 10MB — a smaller export will look just as good.',
    );
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () =>
        reject(new CoverFileError('That image couldn’t be read.'));
      img.src = objectUrl;
    });

    const scale = Math.min(
      1,
      MAX_EDGE_PX / Math.max(image.naturalWidth, image.naturalHeight),
    );
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new CoverFileError('This browser can’t process images.');

    // Warm paper behind any transparency, so PNGs land on-brand.
    context.fillStyle = '#F8F5F1';
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
