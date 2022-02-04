export function getDCCAddress(addrMsb: number, addrLsb: number) {
  return (addrMsb << 8) + addrLsb + 1;
}

export function xor(message: number[]) {
  return message.reduce((a, b) => a ^ b);
}

export function hexStr(nr: number, include0x: boolean = true) {
  return (include0x ? '0x' : '') + nr.toString(16).padStart(2, '0');
}

export function printMessageToHex(
  message: number[] | Buffer,
  doPrint: boolean = false
) {
  let l = [];
  for (const x of message) {
    l.push(hexStr(x));
  }
  const payload = `[${l.join(', ')}]`;
  if (doPrint) {
    console.log(payload);
  }
  return payload;
}

export function red(str: string) {
  return `\x1b[0m\x1b[41m\x1b[37m${str}\x1b[0m`;
}

export function green(str: string) {
  return `\x1b[0m\x1b[42m\x1b[30m${str}\x1b[0m`;
}

export function stringToHex(x: string) {
  return x.split('').map((c) => c.charCodeAt(0));
}

export function hexToString(x: number[]) {
  return x.map((c) => String.fromCharCode(c)).join('');
}
