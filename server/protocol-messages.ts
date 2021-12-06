export const MS_POWER_ON = [
  0x00, 0x00, 0x03, 0x00, 0x05, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00,
];
export const MS_POWER_OFF = [
  0x00, 0x00, 0x03, 0x00, 0x05, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
];

export const MS_LOCO_DRIVE = [
  0x00, 0x08, 0x03, 0x00, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
];
export const MS_LOCO_DIRECTION = [
  0x00, 0x0a, 0x03, 0x00, 0x05, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
];
export const MS_LOCO_FUNCTION = [
  0x00, 0x0c, 0x03, 0x00, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
];
export const MS_TURNOUT = [
  0x00, 0x16, 0x03, 0x00, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
];

export const XPN_GET_CODE_RESPONSE = [0x05, 0x00, 0x18, 0x00, 0x00];
export const XPN_SERIAL_NUMBER_RESPONSE = [
  0x08, 0x00, 0x10, 0x00, 0x4d, 0xc1, 0x02, 0x00,
];
export const XPN_HWINFO_RESPONSE = [
  0x0c, 0x00, 0x1a, 0x00, 0x01, 0x02, 0x00, 0x00, 0x32, 0x01, 0x00, 0x00,
];
export const XPN_X_STATUS_CHANGED = [
  0x08, 0x00, 0x40, 0x00, 0x62, 0x22, 0x00, 0x40,
];
export const XPN_X_BC_TRACK_POWER_OFF = [
  0x07, 0x00, 0x40, 0x00, 0x61, 0x00, 0x61,
];
export const XPN_X_BC_TRACK_POWER_ON = [
  0x07, 0x00, 0x40, 0x00, 0x61, 0x01, 0x60,
];
export const XPN_X_LOCO_INFO = [
  0x0e, 0x00, 0x40, 0x00, 0xef, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00,
];
export const XPN_X_TURNOUT_INFO = [
  0x09, 0x00, 0x40, 0x00, 0x43, 0x00, 0x00, 0x00, 0x00,
];
export const XPN_X_Z21_FIRMWARE_VERSION = [
  0x09, 0x00, 0x40, 0x00, 0xf3, 0x0a, 0x01, 0x32, 0xca,
];
export const XPN_X_STORE1 = [
  0x0e, 0x00, 0x12, 0x00, 0x01, 0x00, 0x01, 0x03, 0x01, 0x00, 0x00, 0x00, 0x00,
  0x00,
];
export const XPN_X_STORE2 = [
  0x14, 0x00, 0x16, 0x00, 0x19, 0x06, 0x07, 0x01, 0x05, 0x14, 0x88, 0x13, 0x10,
  0x27, 0x32, 0x00, 0x50, 0x46, 0x20, 0x4e,
];

// define Z21 constants
export const z21HWTypeMSB = 0x02;
export const z21HWTypeLSB = 0x01;

export const z21FWVersionMSB = 0x01;
export const z21FWVersionLSB = 0x30;
//Seriennummer:
export const z21SnMSB = 0x1a;
export const z21SnLSB = 0xf5;
export const z21Port = 21105;

//Z21LAN Protokoll Spezifikation:
export const LAN_X_HEADER = 0x40;
export const LAN_X_BC_TRACK_POWER = 0x61;
export const LAN_X_UNKNOWN_COMMAND = 0x61;
export const LAN_X_STATUS_CHANGED = 0x62;
export const LAN_X_BC_STOPPED = 0x81;
export const LAN_X_LOCO_INFO = 0xef;
// export const LAN_X_GET_TURNOUT_INFO = 0x43;
// export const LAN_X_SET_TURNOUT = 0x53;
export const LAN_X_TURNOUT_INFO = 0x43;
// export const LAN_X_CV_READ = 0x23;
// export const LAN_X_CV_WRITE = 0x24;
export const LAN_X_CV_NACK_SC = 0x61;
export const LAN_X_CV_NACK = 0x61;
export const LAN_X_CV_RESULT = 0x64;
export const LAN_RMBUS_DATACHANGED = 0x80;
// export const LAN_RMBUS_GETDATA = 0x81;
// export const LAN_RMBUS_PROGRAMMODULE = 0x82;
//  Queries
export const LAN_GET_SERIAL_NUMBER = [0x04, 0x00, 0x10, 0x00];
export const LAN_GET_CODE = [0x04, 0x00, 0x18, 0x00];
export const LAN_GET_HWINFO = [0x04, 0x00, 0x1a, 0x00];
export const LAN_LOGOFF = [0x04, 0x00, 0x30, 0x00];
export const LAN_X_GET_VERSION = [0x07, 0x00, 0x40, 0x00, 0x21, 0x21, 0x00];
export const LAN_X_GET_STATUS = [0x07, 0x00, 0x40, 0x00, 0x21, 0x24, 0x05];
export const LAN_X_SET_TRACK_POWER_OFF = [
  0x07, 0x00, 0x40, 0x00, 0x21, 0x80, 0xa1,
];
export const LAN_X_SET_TRACK_POWER_ON = [
  0x07, 0x00, 0x40, 0x00, 0x21, 0x81, 0xa0,
];
/* ab Z21 FW Version 1.25	*/
export const LAN_X_DCC_READ_REGISTER = [
  0x08, 0x00, 0x40, 0x00, 0x22, 0x11, 0x00, 0x00,
];
export const LAN_X_CV_READ = [
  0x09, 0x00, 0x40, 0x00, 0x23, 0x11, 0x00, 0x00, 0x00,
];
export const LAN_X_DCC_WRITE_REGISTER = [
  0x09, 0x00, 0x40, 0x00, 0x23, 0x12, 0x00, 0x00, 0x00,
];
export const LAN_X_CV_WRITE = [
  0x0a, 0x00, 0x40, 0x00, 0x24, 0x12, 0x00, 0x00, 0x00, 0x00,
];
/* since Z21 FW Version 1.23	*/
export const LAN_X_MM_WRITE_BYTE = [
  0x0a, 0x00, 0x40, 0x00, 0x24, 0xff, 0x00, 0x00, 0x00, 0x00,
];
export const LAN_X_GET_TURNOUT_INFO = [
  0x08, 0x00, 0x40, 0x00, 0x43, 0x00, 0x00, 0x00,
];
export const LAN_X_SET_TURNOUT = [
  0x09, 0x00, 0x40, 0x00, 0x53, 0x00, 0x00, 0x00, 0x00,
];
export const LAN_X_SET_STOP = [0x06, 0x00, 0x40, 0x00, 0x80, 0x80];
export const LAN_X_GET_LOCO_INFO = [
  0x09, 0x00, 0x40, 0x00, 0xe3, 0xf0, 0x00, 0x00, 0x00,
];
export const LAN_X_SET_LOCO_DRIVE = [
  0x0a, 0x00, 0x40, 0x00, 0xe4, 0x00, 0x00, 0x00, 0x00, 0x00,
];
export const LAN_X_SET_LOCO_FUNCTION = [
  0x0a, 0x00, 0x40, 0x00, 0xe4, 0xf8, 0x00, 0x00, 0x00, 0x00,
];
export const LAN_X_CV_POM_WRITE_BYTE = [
  0x0c, 0x00, 0x40, 0x00, 0xe6, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
];
export const LAN_X_CV_POM_WRITE_BIT = [
  0x0c, 0x00, 0x40, 0x00, 0xe6, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
];
export const LAN_X_CV_POM_READ_BYTE = [
  0x0c, 0x00, 0x40, 0x00, 0xe6, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
];
export const LAN_X_CV_POM_ACCESSORY_WRITE_BYTE = [
  0x0c, 0x00, 0x40, 0x00, 0xe6, 0x31, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
];
export const LAN_X_CV_POM_ACCESSORY_WRITE_BIT = [
  0x0c, 0x00, 0x40, 0x00, 0xe6, 0x31, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
];
export const LAN_X_CV_POM_ACCESSORY_READ_BYTE = [
  0x0c, 0x00, 0x40, 0x00, 0xe6, 0x31, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
];
export const LAN_X_GET_FIRMWARE_VERSION = [
  0x07, 0x00, 0x40, 0x00, 0xf1, 0x0a, 0xfb,
];
export const LAN_SET_BROADCASTFLAGS = [
  0x08, 0x00, 0x50, 0x00, 0x00, 0x00, 0x00, 0x00,
];
export const LAN_GET_BROADCASTFLAGS = [0x04, 0x00, 0x51, 0x00];
export const LAN_GET_LOCOMODE = [0x06, 0x00, 0x60, 0x00, 0x00, 0x00];
export const LAN_SET_LOCOMODE = [0x07, 0x00, 0x61, 0x00, 0x00, 0x00, 0x00];
export const LAN_GET_TURNOUTMODE = [0x06, 0x00, 0x70, 0x00, 0x00, 0x00];
export const LAN_SET_TURNOUTMODE = [0x07, 0x00, 0x71, 0x00, 0x00, 0x00, 0x00];
export const LAN_RMBUS_GETDATA = [0x05, 0x00, 0x81, 0x00, 0x00];
export const LAN_RMBUS_PROGRAMMODULE = [0x05, 0x00, 0x82, 0x00, 0x00];
export const LAN_SYSTEMSTATE_GETDATA = [0x04, 0x00, 0x85, 0x00];
export const LAN_RAILCOM_GETDATA = [0x07, 0x00, 0x89, 0x00, 0x00, 0x00, 0x00];
export const LAN_LOCONET_FROM_LAN = [0x04, 0x00, 0xa2, 0x00];
export const LAN_LOCONET_DISPATCH_ADDR = [0x06, 0x00, 0xa3, 0x00, 0x00, 0x00];
export const LAN_LOCONET_DETECTOR = [0x07, 0x00, 0xa4, 0x00, 0x00, 0x00, 0x00];
export const LAN_CAN_DETECTOR = [0x07, 0x00, 0xc4, 0x00, 0x00, 0x00, 0x00];

//  Responses
export const LAN_SERIAL_NUMBER = [
  0x08, 0x00, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00,
];
export const LAN_CODE = [0x05, 0x00, 0x18, 0x00, 0x00];
export const LAN_HWINFO = [
  0x0c, 0x00, 0x1a, 0x00, 0x01, 0x02, 0x00, 0x00, 0x30, 0x01, 0x00, 0x00,
];
export const LAN_BROADCASTFLAGS = [
  0x08, 0x00, 0x51, 0x00, 0x00, 0x00, 0x00, 0x00,
];
export const LAN_SYSTEMSTATE_DATACHANGED = [
  0x14, 0x00, 0x84, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
];
// export const LAN_X_BC_STOPPED = [0x07, 0x00, 0x40, 0x00, 0x81, 0x00, 0x81];
export const LAN_X_VERSION = [
  0x09, 0x00, 0x40, 0x00, 0x63, 0x21, 0x30, 0x12, 0x60,
];
export const LAN_X_STATUS = [0x08, 0x00, 0x40, 0x00, 0x62, 0x22, 0x00, 0x40];
export const LAN_X_BC_TRACK_POWER_OFF = [
  0x07, 0x00, 0x40, 0x00, 0x61, 0x00, 0x61,
];
export const LAN_X_BC_TRACK_POWER_ON = [
  0x07, 0x00, 0x40, 0x00, 0x61, 0x01, 0x60,
];
export const LAN_X_FIRMWARE_VERSION = [
  0x09, 0x00, 0x40, 0x00, 0xf3, 0x0a, 0x01, 0x30, 0xc8,
];

export const LAN_RAILCOM_DATACHANGED = 0x88;
// export const LAN_RAILCOM_GETDATA = 0x89;

export const LAN_LOCONET_Z21_RX = 0xa0;
export const LAN_LOCONET_Z21_TX = 0xa1;
// export const LAN_LOCONET_FROM_LAN = 0xa2;
// export const LAN_LOCONET_DISPATCH_ADDR = 0xa3;
// export const LAN_LOCONET_DETECTOR = 0xa4;

// //**************************************************************
// //Z21 BC Flags
export const Z21bcNone = 0b00000000;
export const Z21bcAll = 0x00000001;
export const Z21bcAll_s = 0b00000001;
export const Z21bcRBus = 0x00000002;
export const Z21bcRBus_s = 0b00000010;
export const Z21bcRailcom = 0x00000004;
export const Z21bcRailcom_s = 0x100;

export const Z21bcSystemInfo = 0x00000100;
export const Z21bcSystemInfo_s = 0b00000100;

// //ab FW Version 1.20:
export const Z21bcNetAll = 0x00010000;
export const Z21bcNetAll_s = 0b00001000;

export const Z21bcLocoNet = 0x01000000;
export const Z21bcLocoNet_s = 0b00010000;
export const Z21bcLocoNetLocos = 0x02000000;
export const Z21bcLocoNetLocos_s = 0b00100000;
export const Z21bcLocoNetSwitches = 0x04000000;
export const Z21bcLocoNetSwitches_s = 0b01000000;

//ab FW Version 1.22:
export const Z21bcLocoNetGBM = 0x08000000;
export const Z21bcLocoNetGBM_s = 0b10000000;

//ab FW Version 1.29:
export const Z21bcRailComAll = 0x00040000;
export const Z21bcRailComAll_s = 0x200;

//ab FW Version 1.30:
export const Z21bcCANDetector = 0x00080000;
export const Z21bcCANDetector_s = 0x400;
