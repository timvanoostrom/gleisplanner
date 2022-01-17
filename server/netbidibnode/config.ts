const UNKNOWN = 'UNKNOWN_TYPE';

export type NodeAddress = [number, number, number, 0x00];
export const CS_NODE_ADDRESS: NodeAddress = [0x00, 0x00, 0x00, 0x00];

// prettier-ignore
export const BIDIB_MESSAGE_TYPES = [
		UNKNOWN,                                                // 0x00
		"MSG_SYS_GET_MAGIC",                                    // 0x01
		"MSG_SYS_GET_P_VERSION",                                // 0x02
		"MSG_SYS_ENABLE",                                       // 0x03
		"MSG_SYS_DISABLE",                                      // 0x04
		"MSG_SYS_GET_UNIQUE_ID",                                // 0x05
		"MSG_SYS_GET_SW_VERSION",                               // 0x06
		"MSG_SYS_PING",                                         // 0x07
		"MSG_SYS_IDENTIFY",                                     // 0x08
		"MSG_SYS_RESET",                                        // 0x09
		"MSG_GET_PKT_CAPACITY",                                 // 0x0A
		"MSG_NODETAB_GETALL",                                   // 0x0B
		"MSG_NODETAB_GETNEXT",                                  // 0x0C
		"MSG_NODE_CHANGED_ACK",                                 // 0x0D
		"MSG_SYS_GET_ERROR",                                    // 0x0E
		"MSG_FW_UPDATE_OP",                                     // 0x0F

		//-- feature and user config messages
		"MSG_FEATURE_GET_ALL",                                  // 0x10
		"MSG_FEATURE_GETNEXT",                                  // 0x11
		"MSG_FEATURE_GET",                                      // 0x12
		"MSG_FEATURE_SET",                                      // 0x13
		"MSG_VENDOR_ENABLE",                                    // 0x14
		"MSG_VENDOR_DISABLE",                                   // 0x15
		"MSG_VENDOR_SET",                                       // 0x16
		"MSG_VENDOR_GET",                                       // 0x17
		"MSG_SYS_CLOCK",                                        // 0x18
		"MSG_STRING_GET",                                       // 0x19
		"MSG_STRING_SET",                                       // 0x1A
		UNKNOWN,                                                // 0x1B
		UNKNOWN,                                                // 0x1C
		UNKNOWN,                                                // 0x1D
		UNKNOWN,                                                // 0x1E
		UNKNOWN,                                                // 0x1F

		//-- occupancy messages
		"MSG_BM_GET_RANGE",                                     // 0x20
		"MSG_BM_MIRROR_MULTIPLE",                               // 0x21
		"MSG_BM_MIRROR_OCC",                                    // 0x22
		"MSG_BM_MIRROR_FREE",                                   // 0x23
		"MSG_BM_ADDR_GET_RANGE",                                // 0x24
		"MSG_BM_GET_CONFIDENCE",                                // 0x25
		"MSG_BM_MIRROR_POSITION",                               // 0x26
		UNKNOWN,                                                // 0x27
		UNKNOWN,                                                // 0x28
		UNKNOWN,                                                // 0x29
		UNKNOWN,                                                // 0x2A
		UNKNOWN,                                                // 0x2B
		UNKNOWN,                                                // 0x2C
		UNKNOWN,                                                // 0x2D
		UNKNOWN,                                                // 0x2E
		UNKNOWN,                                                // 0x2F

		//-- booster messages
		"MSG_BOOST_OFF",                                        // 0x30
		"MSG_BOOST_ON",                                         // 0x31
		"MSG_BOOST_QUERY",                                      // 0x32
		UNKNOWN,                                                // 0x33
		UNKNOWN,                                                // 0x34
		UNKNOWN,                                                // 0x35
		UNKNOWN,                                                // 0x36
		UNKNOWN,                                                // 0x37

		//-- accessory control messages
		"MSG_ACCESSORY_SET",                                    // 0x38
		"MSG_ACCESSORY_GET",                                    // 0x39
		"MSG_ACCESSORY_PARA_SET",                               // 0x3A
		"MSG_ACCESSORY_PARA_GET",                               // 0x3B
		UNKNOWN,                                                // 0x3C
		UNKNOWN,                                                // 0x3D
		UNKNOWN,                                                // 0x3E

		//-- switch/light/servo control messages
		"MSG_LC_PORT_QUERY_ALL",                                // 0x3F
		"MSG_LC_OUTPUT",                                        // 0x40
		UNKNOWN,                                                // 0x41
		UNKNOWN,                                                // 0x42
		UNKNOWN,                                                // 0x43
		"MSG_LC_PORT_QUERY",                                    // 0x44
		"MSG_LC_CONFIGX_GET_ALL",                               // 0x45
		"MSG_LC_CONFIGX_SET",                                   // 0x46
		"MSG_LC_CONFIGX_GET",                                   // 0x47

		//-- macro messages
		"MSG_LC_MACRO_HANDLE",                                  // 0x48
		"MSG_LC_MACRO_SET",                                     // 0x49
		"MSG_LC_MACRO_GET",                                     // 0x4A
		"MSG_LC_MACRO_PARA_SET",                                // 0x4B
		"MSG_LC_MACRO_PARA_GET",                                // 0x4C
		UNKNOWN,                                                // 0x4D
		UNKNOWN,                                                // 0x4E
		UNKNOWN,                                                // 0x4F
		UNKNOWN,                                                // 0x50
		UNKNOWN,                                                // 0x51
		UNKNOWN,                                                // 0x52
		UNKNOWN,                                                // 0x53
		UNKNOWN,                                                // 0x54
		UNKNOWN,                                                // 0x55
		UNKNOWN,                                                // 0x56
		UNKNOWN,                                                // 0x57
		UNKNOWN,                                                // 0x58
		UNKNOWN,                                                // 0x59
		UNKNOWN,                                                // 0x5A
		UNKNOWN,                                                // 0x5B
		UNKNOWN,                                                // 0x5C
		UNKNOWN,                                                // 0x5D
		UNKNOWN,                                                // 0x5E
		UNKNOWN,                                                // 0x5F

		//-- dcc gen messages
		"MSG_CS_ALLOCATE",                                      // 0x60
		UNKNOWN,                                                // 0x61
		"MSG_CS_SET_STATE",                                     // 0x62
		UNKNOWN,                                                // 0x63
		"MSG_CS_DRIVE",                                         // 0x64
		"MSG_CS_ACCESSORY",                                     // 0x65
		"MSG_CS_BIN_STATE",                                     // 0x66
		"MSG_CS_POM",                                           // 0x67
		"MSG_CS_RCPLUS",                                        // 0x68
		UNKNOWN,                                                // 0x69
		UNKNOWN,                                                // 0x6A
		UNKNOWN,                                                // 0x6B
		UNKNOWN,                                                // 0x6C
		UNKNOWN,                                                // 0x6D
		UNKNOWN,                                                // 0x6E
		"MSG_CS_PROG",                                          // 0x6F
		UNKNOWN,                                                // 0x70
		UNKNOWN,                                                // 0x71
		UNKNOWN,                                                // 0x72
		UNKNOWN,                                                // 0x73
		UNKNOWN,                                                // 0x74
		UNKNOWN,                                                // 0x75
		UNKNOWN,                                                // 0x76
		UNKNOWN,                                                // 0x77
		UNKNOWN,                                                // 0x78
		UNKNOWN,                                                // 0x79
		UNKNOWN,                                                // 0x7A
		UNKNOWN,                                                // 0x7B
		UNKNOWN,                                                // 0x7C
		UNKNOWN,                                                // 0x7D
		UNKNOWN,                                                // 0x7E
		UNKNOWN,                                                // 0x7F

		//-- UPLINK

		//-- system messages
		UNKNOWN,                                                // 0x80
		"MSG_SYS_MAGIC",                                        // 0x81
		"MSG_SYS_PONG",                                         // 0x82
		"MSG_SYS_P_VERSION",                                    // 0x83
		"MSG_SYS_UNIQUE_ID",                                    // 0x84
		"MSG_SYS_SW_VERSION",                                   // 0x85
		"MSG_SYS_ERROR",                                        // 0x86
		"MSG_SYS_IDENTIFY_STATE",                               // 0x87
		"MSG_NODETAB_COUNT",                                    // 0x88
		"MSG_NODETAB",                                          // 0x89
		"MSG_PKT_CAPACITY",                                     // 0x8A
		"MSG_NODE_NA",                                          // 0x8B
		"MSG_NODE_LOST",                                        // 0x8C
		"MSG_NODE_NEW",                                         // 0x8D
		"MSG_STALL",                                            // 0x8E
		"MSG_FW_UPDATE_STAT",                                   // 0x8F

		//-- feature and user config messages
		"MSG_FEATURE",                                          // 0x90
		"MSG_FEATURE_NA",                                       // 0x91
		"MSG_FEATURE_COUNT",                                    // 0x92
		"MSG_VENDOR",                                           // 0x93
		"MSG_VENDOR_ACK",                                       // 0x94
		"MSG_STRING",                                           // 0x95
		UNKNOWN,                                                // 0x96
		UNKNOWN,                                                // 0x97
		UNKNOWN,                                                // 0x98
		UNKNOWN,                                                // 0x99
		UNKNOWN,                                                // 0x9A
		UNKNOWN,                                                // 0x9B
		UNKNOWN,                                                // 0x9C
		UNKNOWN,                                                // 0x9D
		UNKNOWN,                                                // 0x9E
		UNKNOWN,                                                // 0x9F

		//-- occupancy messages
		"MSG_BM_OCC",                                           // 0xA0
		"MSG_BM_FREE",                                          // 0xA1
		"MSG_BM_MULTIPLE",                                      // 0xA2
		"MSG_BM_ADDRESS",                                       // 0xA3
		UNKNOWN,                                                // 0xA4
		"MSG_BM_CV",                                            // 0xA5
		"MSG_BM_SPEED",                                         // 0xA6
		"MSG_BM_CURRENT",                                       // 0xA7
		"MSG_BM_XPOM",                                          // 0xA8
		"MSG_BM_CONFIDENCE",                                    // 0xA9
		"MSG_BM_DYN_STATE",                                     // 0xAA
		"MSG_BM_RCPLUS",                                        // 0xAB
		"MSG_BM_POSITION",                                      // 0xAC
		UNKNOWN,                                                // 0xAD
		UNKNOWN,                                                // 0xAE
		UNKNOWN,                                                // 0xAF

		//-- booster messages
		"MSG_BOOST_STAT",                                       // 0xB0
		"MSG_BOOST_CURRENT",                                    // 0xB1
		"MSG_BOOST_DIAGNOSTIC",                                 // 0xB2
		UNKNOWN,                                                // 0xB3
		UNKNOWN,                                                // 0xB4
		UNKNOWN,                                                // 0xB5
		UNKNOWN,                                                // 0xB6
		UNKNOWN,                                                // 0xB7

		//-- accessory control messages
		"MSG_ACCESSORY_STATE",                                  // 0xB8
		"MSG_ACCESSORY_PARA",                                   // 0xB9
		"MSG_ACCESSORY_NOTIFY",                                 // 0xBA
		UNKNOWN,                                                // 0xBB
		UNKNOWN,                                                // 0xBC
		UNKNOWN,                                                // 0xBD
		UNKNOWN,                                                // 0xBE
		UNKNOWN,                                                // 0xBF

		//-- switch/light/servo control messages
		"MSG_LC_STAT",                                          // 0xC0
		"MSG_LC_NA",                                            // 0xC1
		"MSG_LC_CONFIG",                                        // 0xC2
		"MSG_LC_KEY",                                           // 0xC3
		"MSG_LC_WAIT",                                          // 0xC4
		UNKNOWN,                                                // 0xC5
		"MSG_LC_CONFIGX",                                       // 0xC6
		UNKNOWN,                                                // 0xC7

		//-- macro messages
		"MSG_LC_MACRO_STATE",                                   // 0xC8
		"MSG_LC_MACRO",                                         // 0xC9
		"MSG_LC_MACRO_PARA",                                    // 0xCA
		UNKNOWN,                                                // 0xCB
		UNKNOWN,                                                // 0xCC
		UNKNOWN,                                                // 0xCD
		UNKNOWN,                                                // 0xCE
		UNKNOWN,                                                // 0xCF
		UNKNOWN,                                                // 0xD0
		UNKNOWN,                                                // 0xD1
		UNKNOWN,                                                // 0xD2
		UNKNOWN,                                                // 0xD3
		UNKNOWN,                                                // 0xD4
		UNKNOWN,                                                // 0xD5
		UNKNOWN,                                                // 0xD6
		UNKNOWN,                                                // 0xD7
		UNKNOWN,                                                // 0xD8
		UNKNOWN,                                                // 0xD9
		UNKNOWN,                                                // 0xDA
		UNKNOWN,                                                // 0xDB
		UNKNOWN,                                                // 0xDC
		UNKNOWN,                                                // 0xDD
		UNKNOWN,                                                // 0xDE
		UNKNOWN,                                                // 0xDF

		//-- dcc gen messages
		UNKNOWN,                                                // 0xE0
		"MSG_CS_STATE",                                         // 0xE1
		"MSG_CS_DRIVE_ACK",                                     // 0xE2
		"MSG_CS_ACCESSORY_ACK",                                 // 0xE3
		"MSG_CS_POM_ACK",                                       // 0xE4
		"MSG_CS_DRIVE_MANUAL",                                  // 0xE5
		"MSG_CS_DRIVE_EVENT",                                   // 0xE6
		"MSG_CS_ACCESSORY_MANUAL",                              // 0xE7
		"MSG_CS_RCPLUS_ACK",                                    // 0xE8
		UNKNOWN,                                                // 0xE9
		UNKNOWN,                                                // 0xEA
		UNKNOWN,                                                // 0xEB
		UNKNOWN,                                                // 0xEC
		UNKNOWN,                                                // 0xED
		UNKNOWN,                                                // 0xEE
		"MSG_CS_PROG_STATE",                                    // 0xEF
		UNKNOWN,                                                // 0xF0
		UNKNOWN,                                                // 0xF1
		UNKNOWN,                                                // 0xF2
		UNKNOWN,                                                // 0xF3
		UNKNOWN,                                                // 0xF4
		UNKNOWN,                                                // 0xF5
		UNKNOWN,                                                // 0xF6
		UNKNOWN,                                                // 0xF7
		UNKNOWN,                                                // 0xF8
		UNKNOWN,                                                // 0xF9
		UNKNOWN,                                                // 0xFA
		UNKNOWN,                                                // 0xFB
		UNKNOWN,                                                // 0xFC
		UNKNOWN,                                                // 0xFD
		UNKNOWN,                                                // 0xFE
		UNKNOWN                                                 // 0xFF
];

// prettier-ignore
export const BIDIB_ERROR_MESSAGE_TYPES = [
		"BIDIB_ERR_NONE",                                       // 0x00
		"BIDIB_ERR_TXT",                                        // 0x01
		"BIDIB_ERR_CRC",                                        // 0x02
		"BIDIB_ERR_SIZE",                                       // 0x03
		"BIDIB_ERR_SEQUENCE",                                   // 0x04
		"BIDIB_ERR_PARAMETER",                                  // 0x05
		UNKNOWN,                                                // 0x06
		UNKNOWN,                                                // 0x07
		UNKNOWN,                                                // 0x08
		UNKNOWN,                                                // 0x09
		UNKNOWN,                                                // 0x0A
		UNKNOWN,                                                // 0x0B
		UNKNOWN,                                                // 0x0C
		UNKNOWN,                                                // 0x0D
		UNKNOWN,                                                // 0x0E
		UNKNOWN,                                                // 0x0F
		"BIDIB_ERR_BUS",                                        // 0x10
		"BIDIB_ERR_ADDRSTACK",                                  // 0x11
		"BIDIB_ERR_IDDOUBLE",                                   // 0x12
		"BIDIB_ERR_SUBCRC",                                     // 0x13
		"BIDIB_ERR_SUBTIME",                                    // 0x14
		"BIDIB_ERR_SUBPAKET",                                   // 0x15
		"BIDIB_ERR_OVERRUN",                                    // 0x16
		UNKNOWN,                                                // 0x17
		UNKNOWN,                                                // 0x18
		UNKNOWN,                                                // 0x19
		UNKNOWN,                                                // 0x1A
		UNKNOWN,                                                // 0x1B
		UNKNOWN,                                                // 0x1C
		UNKNOWN,                                                // 0x1D
		UNKNOWN,                                                // 0x1E
		UNKNOWN,                                                // 0x1F
		"BIDIB_ERR_HW",                                         // 0x20
		"BIDIB_ERR_RESET_REQUIRED",                             // 0x21
		UNKNOWN,                                                // 0x22
		UNKNOWN,                                                // 0x23
		UNKNOWN,                                                // 0x24
		UNKNOWN,                                                // 0x25
		UNKNOWN,                                                // 0x26
		UNKNOWN,                                                // 0x27
		UNKNOWN,                                                // 0x28
		UNKNOWN,                                                // 0x29
		UNKNOWN,                                                // 0x2A
		UNKNOWN,                                                // 0x2B
		UNKNOWN,                                                // 0x2C
		UNKNOWN,                                                // 0x2D
		UNKNOWN,                                                // 0x2E
		UNKNOWN,                                                // 0x2F
		"BIDIB_ERR_NO_SECACK_BY_HOST"                           // 0x30
];

// prettier-ignore
export const BIDIB_BUS_ERROR_STRING_MAPPING = [
		"Short circuit",                                        // 0
		"Bus interrupted, missing termination resistors",       // 1
		"Too many termination resistors",                       // 2
		"Logon failure, inconsistencies in the node table",     // 3
		"Logon failure, too many nodes in this level",          // 4
		"Bus failure, overrun occurred at the bus master",      // 5
		"Bus failure, token at the bus master occurred"         // 6
];

// prettier-ignore
export const BIDIB_BOOST_STAT_ERROR_STRING_MAPPING = [
		"BIDIB_BST_STATE_OFF",                                  // 0x00
		"BIDIB_BST_STATE_SHORT",                                // 0x01
		"BIDIB_BST_STATE_OFF_HOT",                              // 0x02
		"BIDIB_BST_STATE_NOPOWER",                              // 0x03
		"BIDIB_BST_STATE_OFF_GO_REQ",                           // 0x04
		"BIDIB_BST_STATE_OFF_HERE",                             // 0x05
		"BIDIB_BST_STATE_OFF_NO_DCC",                           // 0x06
		UNKNOWN,                                                // 0x07
		UNKNOWN,                                                // 0x08
		UNKNOWN,                                                // 0x09
		UNKNOWN,                                                // 0x0A
		UNKNOWN,                                                // 0x0B
		UNKNOWN,                                                // 0x0C
		UNKNOWN,                                                // 0x0D
		UNKNOWN,                                                // 0x0E
		UNKNOWN,                                                // 0x0F
		UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN,   // 0x10-0x15
		UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN,   // 0x16-0x1B
		UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN,                     // 0x1C-0x1F
		UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN,   // 0x20-0x25
		UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN,   // 0x26-0x2B
		UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN,                     // 0x2C-0x2F
		UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN,   // 0x30-0x35
		UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN,   // 0x36-0x3B
		UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN,                     // 0x3C-0x3F
		UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN,   // 0x40-0x45
		UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN,   // 0x46-0x4B
		UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN,                     // 0x4C-0x4F
		UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN,   // 0x50-0x55
		UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN,   // 0x56-0x5B
		UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN,                     // 0x5C-0x5F
		UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN,   // 0x60-0x65
		UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN,   // 0x66-0x6B
		UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN,                     // 0x6C-0x6F
		UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN,   // 0x70-0x75
		UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN,   // 0x76-0x7B
		UNKNOWN, UNKNOWN, UNKNOWN, UNKNOWN,                     // 0x7C-0x7F
		"BIDIB_BST_STATE_ON",                                   // 0x80
		"BIDIB_BST_STATE_ON_LIMIT",                             // 0x81
		"BIDIB_BST_STATE_ON_HOT",                               // 0x82
		"BIDIB_BST_STATE_ON_STOP_REQ",                          // 0x83
		"BIDIB_BST_STATE_ON_HERE",                              // 0x84
];

export const BIDIB_CRC_ARRAY = [
  0x00, 0x5e, 0xbc, 0xe2, 0x61, 0x3f, 0xdd, 0x83, 0xc2, 0x9c, 0x7e, 0x20, 0xa3,
  0xfd, 0x1f, 0x41, 0x9d, 0xc3, 0x21, 0x7f, 0xfc, 0xa2, 0x40, 0x1e, 0x5f, 0x01,
  0xe3, 0xbd, 0x3e, 0x60, 0x82, 0xdc, 0x23, 0x7d, 0x9f, 0xc1, 0x42, 0x1c, 0xfe,
  0xa0, 0xe1, 0xbf, 0x5d, 0x03, 0x80, 0xde, 0x3c, 0x62, 0xbe, 0xe0, 0x02, 0x5c,
  0xdf, 0x81, 0x63, 0x3d, 0x7c, 0x22, 0xc0, 0x9e, 0x1d, 0x43, 0xa1, 0xff, 0x46,
  0x18, 0xfa, 0xa4, 0x27, 0x79, 0x9b, 0xc5, 0x84, 0xda, 0x38, 0x66, 0xe5, 0xbb,
  0x59, 0x07, 0xdb, 0x85, 0x67, 0x39, 0xba, 0xe4, 0x06, 0x58, 0x19, 0x47, 0xa5,
  0xfb, 0x78, 0x26, 0xc4, 0x9a, 0x65, 0x3b, 0xd9, 0x87, 0x04, 0x5a, 0xb8, 0xe6,
  0xa7, 0xf9, 0x1b, 0x45, 0xc6, 0x98, 0x7a, 0x24, 0xf8, 0xa6, 0x44, 0x1a, 0x99,
  0xc7, 0x25, 0x7b, 0x3a, 0x64, 0x86, 0xd8, 0x5b, 0x05, 0xe7, 0xb9, 0x8c, 0xd2,
  0x30, 0x6e, 0xed, 0xb3, 0x51, 0x0f, 0x4e, 0x10, 0xf2, 0xac, 0x2f, 0x71, 0x93,
  0xcd, 0x11, 0x4f, 0xad, 0xf3, 0x70, 0x2e, 0xcc, 0x92, 0xd3, 0x8d, 0x6f, 0x31,
  0xb2, 0xec, 0x0e, 0x50, 0xaf, 0xf1, 0x13, 0x4d, 0xce, 0x90, 0x72, 0x2c, 0x6d,
  0x33, 0xd1, 0x8f, 0x0c, 0x52, 0xb0, 0xee, 0x32, 0x6c, 0x8e, 0xd0, 0x53, 0x0d,
  0xef, 0xb1, 0xf0, 0xae, 0x4c, 0x12, 0x91, 0xcf, 0x2d, 0x73, 0xca, 0x94, 0x76,
  0x28, 0xab, 0xf5, 0x17, 0x49, 0x08, 0x56, 0xb4, 0xea, 0x69, 0x37, 0xd5, 0x8b,
  0x57, 0x09, 0xeb, 0xb5, 0x36, 0x68, 0x8a, 0xd4, 0x95, 0xcb, 0x29, 0x77, 0xf4,
  0xaa, 0x48, 0x16, 0xe9, 0xb7, 0x55, 0x0b, 0x88, 0xd6, 0x34, 0x6a, 0x2b, 0x75,
  0x97, 0xc9, 0x4a, 0x14, 0xf6, 0xa8, 0x74, 0x2a, 0xc8, 0x96, 0x15, 0x4b, 0xa9,
  0xf7, 0xb6, 0xe8, 0x0a, 0x54, 0xd7, 0x89, 0x6b, 0x35,
];
