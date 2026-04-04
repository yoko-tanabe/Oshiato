import exifr from 'exifr';

export interface ExifData {
  lat: number;
  lng: number;
  takenAt: string; // ISO 8601形式
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
 * HEICファイルのバイナリを直接スキャンしてEXIFを抽出する
 *
 * HEICファイルはISOBMFFコンテナの中に標準的なTIFF/EXIF形式のデータを持つ。
 * exifrのHEIFパーサーが失敗する場合、"Exif\0\0" マーカーを探して
 * そこから直接TIFFデータを切り出してexifrに渡す。
 */
async function extractExifFromHeicRaw(file: File): Promise<ExifData | null> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // "Exif\0\0"（45 78 69 66 00 00）を探す
  for (let i = 0; i < bytes.length - 10; i++) {
    if (
      bytes[i]     === 0x45 && // E
      bytes[i + 1] === 0x78 && // x
      bytes[i + 2] === 0x69 && // i
      bytes[i + 3] === 0x66 && // f
      bytes[i + 4] === 0x00 && // \0
      bytes[i + 5] === 0x00    // \0
    ) {
      // "Exif\0\0" の直後からTIFFデータが始まる
      const tiffSlice = buffer.slice(i + 6);
      try {
        const result = await exifr.parse(tiffSlice, {
          gps: true,
          tiff: true,
          exif: true,
        });
        if (result?.latitude != null && result?.longitude != null) {
          const takenAt = result.DateTimeOriginal ?? result.CreateDate ?? null;
          return {
            lat: result.latitude,
            lng: result.longitude,
            takenAt: takenAt instanceof Date ? takenAt.toISOString() : new Date().toISOString(),
          };
        }
      } catch {
        // このマーカーでは取得できなかった → 次を探す
      }
    }
  }
  return null;
}

/**
 * 画像ファイルからEXIF情報（GPS座標・撮影日時）を抽出する
 * EXIF情報がない場合は null を返す（エラーにはしない）
 */
export async function extractExif(file: File): Promise<ExifData | null> {
  try {
    const buffer = await file.arrayBuffer();
    const result = await exifr.parse(buffer, {
      gps: true,
      tiff: true,
      exif: true,
    });

    if (result?.latitude != null && result?.longitude != null) {
      const takenAt = result.DateTimeOriginal ?? result.CreateDate ?? null;
      return {
        lat: result.latitude,
        lng: result.longitude,
        takenAt: takenAt instanceof Date ? takenAt.toISOString() : new Date().toISOString(),
      };
    }
  } catch {
    // 通常パース失敗 → HEICフォールバックへ
  }

  // HEICの場合はバイナリ直接解析を試みる
  if (isHeic(file)) {
    return extractExifFromHeicRaw(file);
  }

  return null;
}
