export interface ProcessedImage {
  webp: Blob;       // 本画像（最大1920px、品質80%）
  thumbnail: Blob;  // サムネイル（最大400px、品質70%）
}

/**
 * HEICファイルをImageBitmapに変換する
 * heic-decode は libheif-js v1.19系を使用し、最新iPhoneのHEICに対応
 */
async function convertHeicToImageBitmap(file: File): Promise<ImageBitmap> {
  const decode = (await import('heic-decode')).default;
  const buffer = await file.arrayBuffer();
  const { width, height, data } = await decode({ buffer: new Uint8Array(buffer) });
  const imageData = new ImageData(data, width, height);
  return createImageBitmap(imageData);
}

/**
 * ファイルがHEIC/HEIF形式かどうかを判定する
 */
function isHeic(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    name.endsWith('.heic') ||
    name.endsWith('.heif')
  );
}

/**
 * 画像ファイルをリサイズ・WebP変換・EXIF削除して返す
 * Canvas APIを使うことで自然にEXIFが除去される
 * HEICファイルはまずブラウザのネイティブ対応を試み、
 * 失敗した場合のみ heic2any でJPEGに変換してから処理する
 */
/**
 * プレビュー用: ブラウザで表示できないHEIC等をJPEGのblob URLに変換する。
 * 表示可能な形式ならそのままcreateObjectURLを返す。
 */
export async function createPreviewUrl(file: File): Promise<string> {
  const blobUrl = URL.createObjectURL(file);

  // まず通常の img で読み込めるか試す
  const canDisplay = await new Promise<boolean>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = blobUrl;
  });

  if (canDisplay) return blobUrl;

  // 表示できない場合（HEIC等）→ デコードしてプレビュー用blob URLを生成
  URL.revokeObjectURL(blobUrl);
  try {
    let imageBitmap: ImageBitmap;
    if (isHeic(file)) {
      imageBitmap = await convertHeicToImageBitmap(file);
    } else {
      return ''; // HEIC以外で表示不可 → フォールバック
    }
    const previewBlob = await resizeAndConvert(imageBitmap, 400, 0.7);
    imageBitmap.close();
    return URL.createObjectURL(previewBlob);
  } catch {
    return ''; // 変換失敗 → フォールバック
  }
}

export async function processImage(file: File): Promise<ProcessedImage> {
  let imageBitmap: ImageBitmap;

  if (isHeic(file)) {
    // Safari/iOSはHEICをネイティブで扱えるので直接試みる
    try {
      imageBitmap = await createImageBitmap(file);
    } catch {
      // ネイティブ非対応ブラウザ（Chrome等）は@jsquash/heicで変換
      imageBitmap = await convertHeicToImageBitmap(file);
    }
  } else {
    imageBitmap = await createImageBitmap(file);
  }

  const webp = await resizeAndConvert(imageBitmap, 1920, 0.8);
  const thumbnail = await resizeAndConvert(imageBitmap, 400, 0.7);

  imageBitmap.close();

  return { webp, thumbnail };
}

/**
 * ImageBitmapをリサイズしてWebP Blobに変換する
 */
function resizeAndConvert(
  source: ImageBitmap,
  maxSize: number,
  quality: number
): Promise<Blob> {
  const { width, height } = calcSize(source.width, source.height, maxSize);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context が取得できませんでした');

  ctx.drawImage(source, 0, 0, width, height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('画像の変換に失敗しました'));
      },
      'image/webp',
      quality
    );
  });
}

/**
 * アスペクト比を保ちながら長辺をmaxSize以内に収めるサイズを計算する
 */
function calcSize(
  originalWidth: number,
  originalHeight: number,
  maxSize: number
): { width: number; height: number } {
  if (originalWidth <= maxSize && originalHeight <= maxSize) {
    return { width: originalWidth, height: originalHeight };
  }

  const ratio = Math.min(maxSize / originalWidth, maxSize / originalHeight);
  return {
    width: Math.round(originalWidth * ratio),
    height: Math.round(originalHeight * ratio),
  };
}
