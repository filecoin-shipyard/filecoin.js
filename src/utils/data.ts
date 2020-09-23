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

export const leftPadString = (stringToPad: string, padChar: string, length: number) => {
  let repeatedPadChar = '';

  for (let i = 0; i < length; i++) {
    repeatedPadChar += padChar;
  }

  return ((repeatedPadChar + stringToPad).slice(-length));
}