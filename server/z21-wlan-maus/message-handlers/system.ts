import { xor } from '../../helpers';

export enum SystemState {
  nominal = 0x00,
  csEmergencyStop = 0x01,
  csTrackVoltageOff = 0x02,
  csShortCircuit = 0x04,
  csProgrammingModeActive = 0x20,
}

const systemState: SystemState = SystemState.nominal;

export function LAN_X_STATUS_CHANGED(message: Uint8Array) {
  const payload = [0x08, 0x00, 0x40, 0x00, 0x62, 0x22, systemState];
  // TODO: Verify XOR checksum? Calculation
  let xorByte = xor(payload.slice(4));
  return [...payload, xorByte];
}
