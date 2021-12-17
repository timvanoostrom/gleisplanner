export type Space = number;
export type DataLen = number;
export type Header = number;
export type XHeader = number;
export type DBn = number;
export type XOR = number;
export type B = DataLen | Space | Header | XHeader | DBn | XOR | number;
export type ProtocolMessage = B[];

// Z21 LAN Protocol Specification
// Document Version 1.11 en 11.08.2021 4/68

// 2.1 LAN_GET_SERIAL_NUMBER ................................................................................................................. 11
const LAN_GET_SERIAL_NUMBER = [0x04, 0x00, 0x10, 0x00];
// 2.2 LAN_LOGOFF ............................................................................................................................................. 11
const LAN_LOGOFF = [0x04, 0x00, 0x30, 0x00]; // [0x04,0x00,0x10,0x00]
// 2.3 LAN_X_GET_VERSION ............................................................................................................................. 11
const LAN_X_GET_VERSION = [0x07, 0x00, 0x40, 0x00, 0x21, 0x21 /*, 0x00*/];
// 2.4 LAN_X_GET_STATUS ............................................................................................................................... 12
const LAN_X_GET_STATUS = [0x07, 0x00, 0x40, 0x00, 0x21, 0x24 /*, 0x05*/];
// 2.5 LAN_X_SET_TRACK_POWER_OFF ....................................................................................................... 12
const LAN_X_SET_TRACK_POWER_OFF = [
  0x07, 0x00, 0x40, 0x00, 0x21, 0x80 /*, 0xa1*/,
];
// 2.6 LAN_X_SET_TRACK_POWER_ON ......................................................................................................... 12
const LAN_X_SET_TRACK_POWER_ON = [0x07, 0x00, 0x40, 0x00, 0x21, 0x81, 0xa0];
// 2.7 LAN_X_BC_TRACK_POWER_OFF......................................................................................................... 13
const LAN_X_BC_TRACK_POWER_OFF = [0x07, 0x00, 0x40, 0x00, 0x61, 0x00, 0x61];
// 2.8 LAN_X_BC_TRACK_POWER_ON........................................................................................................... 13
const LAN_X_BC_TRACK_POWER_ON = [0x07, 0x00, 0x40, 0x00, 0x61, 0x01, 0x60];
// 2.9 LAN_X_BC_PROGRAMMING_MODE ................................................................................................... 13
const LAN_X_BC_PROGRAMMING_MODE = 0x00;
// 2.10 LAN_X_BC_TRACK_SHORT_CIRCUIT ................................................................................................ 13
const LAN_X_BC_TRACK_SHORT_CIRCUIT = 0x00;
// 2.11 LAN_X_UNKNOWN_COMMAND ............................................................................................................ 14
const LAN_X_UNKNOWN_COMMAND = 0x61;
// 2.12 LAN_X_STATUS_CHANGED .................................................................................................................... 14
const LAN_X_STATUS_CHANGED = 0x62;
// 2.13 LAN_X_SET_STOP ..................................................................................................................................... 15
const LAN_X_SET_STOP = [0x06, 0x00, 0x40, 0x00, 0x80, 0x80];
// 2.14 LAN_X_BC_STOPPED ............................................................................................................................... 15
const LAN_X_BC_STOPPED = [0x07, 0x00, 0x40, 0x00, 0x81, 0x00, 0x81];
// 2.15 LAN_X_GET_FIRMWARE_VERSION .................................................................................................... 15
const LAN_X_GET_FIRMWARE_VERSION = [0x07, 0x00, 0x40, 0x00, 0xf1, 0x0a, 0xfb];
// 2.16 LAN_SET_BROADCASTFLAGS .............................................................................................................. 16
const LAN_SET_BROADCASTFLAGS = [0x08, 0x00, 0x50, 0x00];
// 2.17 LAN_GET_BROADCASTFLAGS .............................................................................................................. 17
const LAN_GET_BROADCASTFLAGS = [0x04, 0x00, 0x51, 0x00];
// 2.18 LAN_SYSTEMSTATE_DATACHANGED ............................................................................................... 18
const LAN_SYSTEMSTATE_DATACHANGED = [
  0x14, 0x00, 0x84, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
];
// 2.19 LAN_SYSTEMSTATE_GETDATA ........................................................................................................... 18
const LAN_SYSTEMSTATE_GETDATA = [0x04, 0x00, 0x85, 0x00];
// 2.20 LAN_GET_HWINFO ................................................................................................................................... 19
const LAN_GET_HWINFO = [0x04, 0x00, 0x1a, 0x00];
// 2.21 LAN_GET_CODE ........................................................................................................................................ 20
const LAN_GET_CODE = [0x04, 0x00, 0x18, 0x00];
//
// 3 SETTINGS .......................................................................................................................................... 21
//
// 3.1 LAN_GET_LOCOMODE ............................................................................................................................ 21
const LAN_GET_LOCOMODE = [0x06, 0x00, 0x60, 0x00, 0x00, 0x00];
// 3.2 LAN_SET_LOCOMODE ............................................................................................................................. 21
const LAN_SET_LOCOMODE = [0x07, 0x00, 0x61, 0x00, 0x00, 0x00, 0x00];
// 3.3 LAN_GET_TURNOUTMODE .................................................................................................................... 22
const LAN_GET_TURNOUTMODE = [0x06, 0x00, 0x70, 0x00, 0x00, 0x00];
// 3.4 LAN_SET_TURNOUTMODE .................................................................................................................... 22
const LAN_SET_TURNOUTMODE = [0x07, 0x00, 0x71, 0x00, 0x00, 0x00, 0x00];
//
// 4 DRIVING ............................................................................................................................................. 23
//
// 4.1 LAN_X_GET_LOCO_INFO ....................................................................................................................... 23
const LAN_X_GET_LOCO_INFO = [0x09, 0x00, 0x40, 0x00, 0xe3, 0xf0];

// 4.2 LAN_X_SET_LOCO_DRIVE ..................................................................................................................... 24
const LAN_X_SET_LOCO_DRIVE = [
  0x0a,
  0x00,
  0x40,
  0x00,
  0xe4,
  [0x10, 0x12, 0x13],
  /*
  0x00,
  0x00,
  0x00,
  0x00,
  */
];
// 4.3 LAN_X_SET_LOCO_FUNCTION ............................................................................................................. 25
const LAN_X_SET_LOCO_FUNCTION = [0x0a, 0x00, 0x40, 0x00, 0xe4, 0xf8];
// 4.4 LAN_X_LOCO_INFO .................................................................................................................................. 26
const LAN_X_LOCO_INFO = 0xef;
//
// 5 SWITCHING ........................................................................................................................................ 27
//
// 5.1 LAN_X_GET_TURNOUT_INFO ............................................................................................................... 28
const LAN_X_GET_TURNOUT_INFO = [0x08, 0x00, 0x40, 0x00, 0x43];
// 5.2 LAN_X_SET_TURNOUT ............................................................................................................................ 28
const LAN_X_SET_TURNOUT = [0x09, 0x00, 0x40, 0x00, 0x53];
// 5.2.1 LAN_X_SET_TURNOUT with Q=0 ..................................................................................................... 28
// const LAN_X_SET_TURNOUT = 0x00;
// 5.2.2 LAN_X_SET_TURNOUT with Q=1 ..................................................................................................... 30
// const LAN_X_SET_TURNOUT = 0x00;

// 5.3 LAN_X_TURNOUT_INFO.......................................................................................................................... 31
const LAN_X_TURNOUT_INFO = [0x09, 0x00, 0x40, 0x00, 0x43];
// 5.4 LAN_X_SET_EXT_ACCESSORY ............................................................................................................. 32
const LAN_X_SET_EXT_ACCESSORY = 0x00;
// 5.5 LAN_X_GET_EXT_ACCESSORY_INFO ................................................................................................ 33
const LAN_X_GET_EXT_ACCESSORY_INFO = 0x00;
// 5.6 LAN_X_EXT_ACCESSORY_INFO ........................................................................................................... 33
const LAN_X_EXT_ACCESSORY_INFO = 0x00;
//
// 6 READING AND WRITING DECODER CVS ....................................................................................... 34
//
// 6.1 LAN_X_CV_READ ...................................................................................................................................... 34
const LAN_X_CV_READ = [0x09, 0x00, 0x40, 0x00, 0x23, 0x11, 0x00, 0x00, 0x00];
// 6.2 LAN_X_CV_WRITE .................................................................................................................................... 34
const LAN_X_CV_WRITE = [
  0x0a, 0x00, 0x40, 0x00, 0x24, 0x12, 0x00, 0x00, 0x00, 0x00,
];
// 6.3 LAN_X_CV_NACK_SC ............................................................................................................................... 34
const LAN_X_CV_NACK_SC = [0x40, 0x00, 0x61, 0x00];
// 6.4 LAN_X_CV_NACK ...................................................................................................................................... 35
const LAN_X_CV_NACK = 0x61;
// 6.5 LAN_X_CV_RESULT .................................................................................................................................. 35
const LAN_X_CV_RESULT = 0x64;
// 6.6 LAN_X_CV_POM_WRITE_BYTE ............................................................................................................ 36
const LAN_X_CV_POM_WRITE_BYTE = [
  0x0c, 0x00, 0x40, 0x00, 0xe6, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
];
// 6.7 LAN_X_CV_POM_WRITE_BIT ................................................................................................................ 36
const LAN_X_CV_POM_WRITE_BIT = [
  0x0c, 0x00, 0x40, 0x00, 0xe6, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
];
// 6.8 LAN_X_CV_POM_READ_BYTE .............................................................................................................. 37
const LAN_X_CV_POM_READ_BYTE = [
  0x0c, 0x00, 0x40, 0x00, 0xe6, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
];
// 6.9 LAN_X_CV_POM_ACCESSORY_WRITE_BYTE ................................................................................. 38
const LAN_X_CV_POM_ACCESSORY_WRITE_BYTE = [
  0x0c, 0x00, 0x40, 0x00, 0xe6, 0x31, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
];
// 6.10 LAN_X_CV_POM_ACCESSORY_WRITE_BIT .................................................................................... 38
const LAN_X_CV_POM_ACCESSORY_WRITE_BIT = [
  0x0c, 0x00, 0x40, 0x00, 0xe6, 0x31, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
];
// 6.11 LAN_X_CV_POM_ACCESSORY_WRITE_BYTE ................................................................................... 39
const LAN_X_CV_POM_ACCESSORY_READ_BYTE = [
  0x0c, 0x00, 0x40, 0x00, 0xe6, 0x31, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
];
// 6.12 LAN_X_MM_WRITE_BYTE ..................................................................................................................... 40
const LAN_X_MM_WRITE_BYTE = [
  0x0a, 0x00, 0x40, 0x00, 0x24, 0xff, 0x00, 0x00, 0x00, 0x00,
];
// 6.13 LAN_X_DCC_READ_REGISTER ............................................................................................................. 41
const LAN_X_DCC_READ_REGISTER = [
  0x08, 0x00, 0x40, 0x00, 0x22, 0x11, 0x00, 0x00,
];
// 6.14 LAN_X_DCC_WRITE_REGISTER........................................................................................................... 41
const LAN_X_DCC_WRITE_REGISTER = [
  0x09, 0x00, 0x40, 0x00, 0x23, 0x12, 0x00, 0x00, 0x00,
];
//
// 7 FEEDBACK – R-BUS ......................................................................................................................... 42
//
// 7.1 LAN_RMBUS_DATACHANGED .............................................................................................................. 42
const LAN_RMBUS_DATACHANGED = 0x80;
// 7.2 LAN_RMBUS_GETDATA .......................................................................................................................... 42
const LAN_RMBUS_GETDATA = [0x05, 0x00, 0x81, 0x00, 0x00];
// 7.3 LAN_RMBUS_PROGRAMMODULE ....................................................................................................... 43
const LAN_RMBUS_PROGRAMMODULE = [0x05, 0x00, 0x82, 0x00, 0x00];
//
// 8 RAILCOM ............................................................................................................................................ 44
//
// 8.1 LAN_RAILCOM_DATACHANGED ......................................................................................................... 44
const LAN_RAILCOM_DATACHANGED = 0x88;
// 8.2 LAN_RAILCOM_GETDATA ..................................................................................................................... 45
const LAN_RAILCOM_GETDATA = [0x07, 0x00, 0x89, 0x00, 0x00, 0x00, 0x00];
//
// 9 LOCONET ........................................................................................................................................... 46
//
// 9.1 LAN_LOCONET_Z21_RX .......................................................................................................................... 47
const LAN_LOCONET_Z21_RX = 0xa0;
// 9.2 LAN_LOCONET_Z21_TX .......................................................................................................................... 47
const LAN_LOCONET_Z21_TX = 0xa1;
// 9.3 LAN_LOCONET_FROM_LAN .................................................................................................................. 47
const LAN_LOCONET_FROM_LAN = [0x04, 0x00, 0xa2, 0x00];
// 9.3.1 DCC Binary State Control Instruction .................................................................................................... 48
// 9.4 LAN_LOCONET_DISPATCH_ADDR ...................................................................................................... 48
const LAN_LOCONET_DISPATCH_ADDR = [0x06, 0x00, 0xa3, 0x00, 0x00, 0x00];
// 9.5 LAN_LOCONET_DETECTOR .................................................................................................................. 50
const LAN_LOCONET_DETECTOR = [0x07, 0x00, 0xa4, 0x00, 0x00, 0x00, 0x00];
//
// 10 CAN ................................................................................................................................................. 54
//
// 10.1 LAN_CAN_DETECTOR ............................................................................................................................. 54
const LAN_CAN_DETECTOR = [0x07, 0x00, 0xc4, 0x00, 0x00, 0x00, 0x00];
// 10.2 CAN Booster .................................................................................................................................................. 56
// 10.2.1 LAN_CAN_DEVICE_GET_DESCRIPTION ........................................................................................ 56
const LAN_CAN_DEVICE_GET_DESCRIPTION = 0x00;
// 10.2.2 LAN_CAN_DEVICE_SET_DESCRIPTION ......................................................................................... 56
const LAN_CAN_DEVICE_SET_DESCRIPTION = 0x00;
// 10.2.3 LAN_CAN_BOOSTER_SYSTEMSTATE_CHGD ............................................................................... 57
const LAN_CAN_BOOSTER_SYSTEMSTATE_CHGD = 0x00;
// 10.2.4 LAN_CAN_BOOSTER_SET_TRACKPOWER .................................................................................... 57
const LAN_CAN_BOOSTER_SET_TRACKPOWER = 0x00;
//
// 11 ZLINK .............................................................................................................................................. 58
//
// 11.1 Adapter .......................................................................................................................................................... 58
// 11.1.1 10838 Z21 pro LINK .............................................................................................................................. 58
// 11.1.1.1 LAN_ZLINK_GET_HWINFO ....................................................................................................... 59
const LAN_ZLINK_GET_HWINFO = 0x00;
// 11.2 Booster 10806, 10807 und 10869 .................................................................................................................. 60
// 11.2.1 LAN_BOOSTER_GET_DESCRIPTION ............................................................................................... 60
const LAN_BOOSTER_GET_DESCRIPTION = 0x00;
// 11.2.2 LAN_BOOSTER_SET_DESCRIPTION ............................................................................................... 60
const LAN_BOOSTER_SET_DESCRIPTION = 0x00;
// 11.2.3 LAN_BOOSTER_SYSTEMSTATE_GETDATA .................................................................................. 61
const LAN_BOOSTER_SYSTEMSTATE_GETDATA = 0x00;
// 11.2.4 LAN_BOOSTER_SYSTEMSTATE_DATACHANGED ...................................................................... 61
const LAN_BOOSTER_SYSTEMSTATE_DATACHANGED = 0x00;
// 11.3 Decoder 10836 und 10837 ............................................................................................................................. 62
// 11.3.1 LAN_DECODER_GET_DESCRIPTION .............................................................................................. 62
const LAN_DECODER_GET_DESCRIPTION = 0x00;
// 11.3.2 LAN_DECODER_SET_DESCRIPTION ............................................................................................... 62
const LAN_DECODER_SET_DESCRIPTION = 0x00;
// 11.3.3 LAN_DECODER_SYSTEMSTATE_GETDATA ................................................................................. 63
const LAN_DECODER_SYSTEMSTATE_GETDATA = 0x00;
// 11.3.4 LAN_DECODER_SYSTEMSTATE_DATACHANGED ..................................................................... 63
const LAN_DECODER_SYSTEMSTATE_DATACHANGED = 0x00;
// 11.3.4.1 SwitchDecoderSystemState ............................................................................................................ 63
// 11.3.4.2 SignalDecoderSystemState ............................................................................................................. 65

export const messages = {
  LAN_GET_SERIAL_NUMBER,
  LAN_LOGOFF,
  LAN_X_GET_VERSION,
  LAN_X_GET_STATUS,
  LAN_X_SET_TRACK_POWER_OFF,
  LAN_X_SET_TRACK_POWER_ON,
  LAN_X_BC_TRACK_POWER_OFF,
  LAN_X_BC_TRACK_POWER_ON,
  LAN_X_BC_PROGRAMMING_MODE,
  LAN_X_BC_TRACK_SHORT_CIRCUIT,
  LAN_X_UNKNOWN_COMMAND,
  LAN_X_STATUS_CHANGED,
  LAN_X_SET_STOP,
  LAN_X_BC_STOPPED,
  LAN_X_GET_FIRMWARE_VERSION,
  LAN_SET_BROADCASTFLAGS,
  LAN_GET_BROADCASTFLAGS,
  LAN_SYSTEMSTATE_DATACHANGED,
  LAN_SYSTEMSTATE_GETDATA,
  LAN_GET_HWINFO,
  LAN_GET_CODE,
  LAN_GET_LOCOMODE,
  LAN_SET_LOCOMODE,
  LAN_GET_TURNOUTMODE,
  LAN_SET_TURNOUTMODE,
  LAN_X_GET_LOCO_INFO,
  LAN_X_SET_LOCO_DRIVE,
  LAN_X_SET_LOCO_FUNCTION,
  LAN_X_LOCO_INFO,
  LAN_X_GET_TURNOUT_INFO,
  LAN_X_SET_TURNOUT,
  LAN_X_TURNOUT_INFO,
  LAN_X_SET_EXT_ACCESSORY,
  LAN_X_GET_EXT_ACCESSORY_INFO,
  LAN_X_EXT_ACCESSORY_INFO,
  LAN_X_CV_READ,
  LAN_X_CV_WRITE,
  LAN_X_CV_NACK_SC,
  LAN_X_CV_NACK,
  LAN_X_CV_RESULT,
  LAN_X_CV_POM_WRITE_BYTE,
  LAN_X_CV_POM_WRITE_BIT,
  LAN_X_CV_POM_READ_BYTE,
  LAN_X_CV_POM_ACCESSORY_WRITE_BYTE,
  LAN_X_CV_POM_ACCESSORY_WRITE_BIT,
  LAN_X_CV_POM_ACCESSORY_READ_BYTE,
  LAN_X_MM_WRITE_BYTE,
  LAN_X_DCC_READ_REGISTER,
  LAN_X_DCC_WRITE_REGISTER,
  // LAN_RMBUS_DATACHANGED,
  // LAN_RMBUS_GETDATA,
  // LAN_RMBUS_PROGRAMMODULE,
  // LAN_RAILCOM_DATACHANGED,
  // LAN_RAILCOM_GETDATA,
  // LAN_LOCONET_Z21_RX,
  // LAN_LOCONET_Z21_TX,
  // LAN_LOCONET_FROM_LAN,
  // LAN_LOCONET_DISPATCH_ADDR,
  // LAN_LOCONET_DETECTOR,
  // LAN_CAN_DETECTOR,
  // LAN_CAN_DEVICE_GET_DESCRIPTION,
  // LAN_CAN_DEVICE_SET_DESCRIPTION,
  // LAN_CAN_BOOSTER_SYSTEMSTATE_CHGD,
  // LAN_CAN_BOOSTER_SET_TRACKPOWER,
  // LAN_ZLINK_GET_HWINFO,
  // LAN_BOOSTER_GET_DESCRIPTION,
  // LAN_BOOSTER_SET_DESCRIPTION,
  // LAN_BOOSTER_SYSTEMSTATE_GETDATA,
  // LAN_BOOSTER_SYSTEMSTATE_DATACHANGED,
  // LAN_DECODER_GET_DESCRIPTION,
  // LAN_DECODER_SET_DESCRIPTION,
  // LAN_DECODER_SYSTEMSTATE_GETDATA,
  // LAN_DECODER_SYSTEMSTATE_DATACHANGED,
};

export const messageEntries = Object.entries(messages);

export const subscribedClientMessages = {
  LAN_X_BC_TRACK_POWER_OFF,
  LAN_X_BC_TRACK_POWER_ON,
  LAN_X_BC_PROGRAMMING_MODE,
  LAN_X_BC_TRACK_SHORT_CIRCUIT,
  LAN_X_BC_STOPPED,
  LAN_X_LOCO_INFO,
  LAN_X_TURNOUT_INFO,
  LAN_X_SET_TURNOUT,
};
