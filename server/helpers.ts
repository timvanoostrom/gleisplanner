// export function le16(u: number) {
//   return (u[1] << 8) | u[0];
// }

// export function be16(u: number) {
//   return (u[0] << 8) | u[1];
// }

// export function be32(u: number) {
//   return (u[0] << 24) | (u[1] << 16) | (u[2] << 8) | u[3];
// }

// export function le32(u: number) {
//   return (u[3] << 24) | (u[2] << 16) | (u[1] << 8) | u[0];
// }

// export function to_le16(u: number, n2: number) {
//   u[0] = n2 & 0xff;
//   u[1] = n2 >> 8;
// }

export function getDCCAddress(addrMsb: number, addrLsb: number) {
  return (addrMsb << 8) + addrLsb + 1;
}

export function xor(message: number[]) {
  return message.reduce((a, b) => a ^ b);
}

export function printMessageToHex(message: number[], doPrint: boolean = false) {
  let l = [];
  for (const x of message) {
    l.push('0x' + x.toString(16).padStart(2, '0'));
  }
  const payload = `[${l.join(', ')}]`;
  if (doPrint) {
    console.log('Payload:', payload);
  }
  return payload;
}

export function red(str: string) {
  return `\x1b[0m\x1b[41m\x1b[37m${str}\x1b[0m`;
}

export function green(str: string) {
  return `\x1b[0m\x1b[42m\x1b[30m${str}\x1b[0m`;
}
