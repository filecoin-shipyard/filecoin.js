import btoa from 'btoa-lite';

export const toBase64 = (data: string | ArrayBuffer): string => {
  if (typeof data !== 'string') {
    data = btoa(
      new Uint8Array(data)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    )
  } else {
    data = btoa(data);
  }
  return data;
}
