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
 * ファイルがHEIC/HEIF形式かどうかを拡張子・MIMEタイプで判定する
 */
function isHeicByName(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    name.endsWith('.heic') ||
    name.endsWith('.heif')
  );
}

/**
 * ファイル先頭のマジックバイトでHEIC/HEIFを判定する
 * LINEなどのSNS経由で .jpg 拡張子のままHEICが届くケースに対応
 */
async function isHeicByMagicBytes(file: File): Promise<boolean> {
  const buffer = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  // HEIC は ISO Base Media File Format: offset 4-7 が 'ftyp', offset 8-11 がブランド名
  const ftyp = String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]);
  if (ftyp !== 'ftyp') return false;
  const brand = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]).toLowerCase();
  return (
    brand.startsWith('heic') ||
    brand.startsWith('heix') ||
    brand.startsWith('hevc') ||
    brand.startsWith('hevx') ||
    brand.startsWith('mif1') ||
    brand.startsWith('msf1')
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
    if (isHeicByName(file)) {
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

  const heicByName = isHeicByName(file);

  if (heicByName) {
    // 拡張子・MIMEタイプがHEICの場合: Safari はネイティブ対応なので直接試みる
    try {
      imageBitmap = await createImageBitmap(file);
    } catch {
      // Chrome等のネイティブ非対応ブラウザは heic-decode で変換
      imageBitmap = await convertHeicToImageBitmap(file);
    }
  } else {
    try {
      imageBitmap = await createImageBitmap(file);
    } catch {
      // .jpg拡張子でも実体がHEICの場合がある（LINE経由のiPhone写真など）
      const heicByBytes = await isHeicByMagicBytes(file);
      if (heicByBytes) {
        imageBitmap = await convertHeicToImageBitmap(file);
      } else {
        // その他の特殊なJPEG等は <img> 要素経由で再試行
        imageBitmap = await loadImageBitmapViaElement(file);
      }
    }
  }

  const webp = await resizeAndConvert(imageBitmap, 1920, 0.8);
  const thumbnail = await resizeAndConvert(imageBitmap, 400, 0.7);

  imageBitmap.close();

  return { webp, thumbnail };
}

async function loadImageBitmapViaElement(file: File): Promise<ImageBitmap> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      createImageBitmap(img).then(resolve).catch(() =>
        reject(new Error('この画像形式には対応していません。JPEGまたはPNG形式でお試しください'))
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('この画像形式には対応していません。JPEGまたはPNG形式でお試しください'));
    };
    img.src = url;
  });
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
