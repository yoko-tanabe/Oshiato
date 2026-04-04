declare module 'heic-decode' {
  interface DecodeResult {
    width: number;
    height: number;
    data: Uint8ClampedArray<ArrayBuffer>;
  }
  function decode(input: { buffer: Uint8Array }): Promise<DecodeResult>;
  export default decode;
}
