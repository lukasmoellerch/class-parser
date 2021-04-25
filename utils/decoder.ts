export const createDecoder = (data: ArrayBuffer) => {
  const dataView = new DataView(data);
  const decoder = new TextDecoder("utf-8");
  let index = 0;
  const offset = (length: number) => {
    const prev = index;
    index += length;
    return prev;
  };
  return {
    getIndex: () => index,
    eof: () => index >= dataView.byteLength,
    getU1: () => dataView.getUint8(offset(1)),
    getU2: () => dataView.getUint16(offset(2)),
    getU4: () => dataView.getUint32(offset(4)),
    getS2: () => dataView.getInt16(offset(2)),
    getS4: () => dataView.getInt32(offset(4)),
    getF4: () => dataView.getFloat32(offset(4)),
    getF8: () => dataView.getFloat64(offset(8)),
    skip: (length: number) => void offset(length),
    getU8() {
      // split 64-bit number into two 32-bit (4-byte) parts
      const left = dataView.getUint32(offset(4));
      const right = dataView.getUint32(offset(4));

      // combine the two 32-bit values
      const combined = 2 ** 32 * left + right;

      if (!Number.isSafeInteger(combined))
        console.warn(
          combined,
          "exceeds MAX_SAFE_INTEGER. Precision may be lost"
        );

      return combined;
    },
    getString: (length: number) => {
      const byteBuffer = data.slice(index, index + length);
      index += length;
      return decoder.decode(byteBuffer);
    },
    getBytes: (length: number) => {
      const byteBuffer = data.slice(index, index + length);
      index += length;
      return byteBuffer;
    },
  };
};
export type Decoder = ReturnType<typeof createDecoder>;
