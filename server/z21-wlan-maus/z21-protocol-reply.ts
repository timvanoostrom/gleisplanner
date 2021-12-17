import {
  LAN_X_LOCO_INFO,
  LAN_X_SET_LOCO_DRIVE_reply,
  LAN_X_SET_LOCO_FUNCTION_reply,
} from './message-handlers/loco';
import { LAN_X_STATUS_CHANGED } from './message-handlers/system';
import {
  LAN_X_SET_TURNOUT,
  LAN_X_TURNOUT_INFO,
} from './message-handlers/turnout';
import { ProtocolMessage } from './z21-protocol';

type ProtocolMessageReply =
  | ProtocolMessage
  | ((message: Uint8Array) => ProtocolMessage);

// b"\x08\x00\x10\x00\x12\x34\x56\x78"
const LAN_GET_SERIAL_NUMBER_reply = [
  // 0x08, 0x00, 0x10, 0x00, 0x4d, 0xc1, 0x02, 0x00,
  0x08, 0x00, 0x10, 0x00, 0x12, 0x34, 0x56, 0x78,
];

const LAN_X_GET_VERSION_reply = [
  0x09, 0x00, 0x40, 0x00, 0x63, 0x21, 0x30, 0x12, 0x60,
];

const LAN_X_GET_FIRMWARE_VERSION_reply = [
  0x09, 0x00, 0x40, 0x00, 0xf3, 0x0a, 0x01, 0x23, 0xdb,
];

export const replies: Record<string, ProtocolMessageReply> = {
  LAN_GET_SERIAL_NUMBER_reply,
  LAN_X_GET_VERSION_reply,
  LAN_X_GET_FIRMWARE_VERSION_reply,
  LAN_X_GET_STATUS_reply: LAN_X_STATUS_CHANGED,
  LAN_X_GET_LOCO_INFO_reply: LAN_X_LOCO_INFO,
  LAN_X_SET_LOCO_FUNCTION_reply,
  LAN_X_SET_LOCO_DRIVE_reply,
  LAN_X_GET_TURNOUT_INFO_reply: LAN_X_TURNOUT_INFO,
  LAN_X_TURNOUT_INFO_reply: LAN_X_TURNOUT_INFO,
  LAN_X_SET_TURNOUT_reply: LAN_X_SET_TURNOUT,
};
