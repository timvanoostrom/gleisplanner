//===============================================================================
//
// 0. Defines for serial protocol / bidib general
//
//===============================================================================

//                              Mainversion   Subversion

export const BIDIB_VERSION = 0 * 256 + 7;

export const BIDIB_SYS_MAGIC = 0xaffe; // full featured BiDiB-Node
export const BIDIB_BOOT_MAGIC = 0xb00d; // reduced Node, bootloader only

//===============================================================================
//
// 1. Defines for Downstream Messages
//
//===============================================================================
//*// = broadcast messages, a interface must forward this to subnodes
//      a node must not answer these messages, if not connected
export const MSG_DSTRM = 0x00;

//-- system messages                                    // Parameters
export const MSG_DSYS = MSG_DSTRM + 0x00;
export const MSG_SYS_GET_MAGIC = MSG_DSYS + 0x01; // - // these must stay here
export const MSG_SYS_GET_P_VERSION = MSG_DSYS + 0x02; // - // these must stay here
export const MSG_SYS_ENABLE = MSG_DSYS + 0x03; //*// -
export const MSG_SYS_DISABLE = MSG_DSYS + 0x04; //*// -
export const MSG_SYS_GET_UNIQUE_ID = MSG_DSYS + 0x05; // -
export const MSG_SYS_GET_SW_VERSION = MSG_DSYS + 0x06; // -
export const MSG_SYS_PING = MSG_DSYS + 0x07; // 1:dat
export const MSG_SYS_IDENTIFY = MSG_DSYS + 0x08; // 1:id_state
export const MSG_SYS_RESET = MSG_DSYS + 0x09; //*// -
export const MSG_GET_PKT_CAPACITY = MSG_DSYS + 0x0a; // -
export const MSG_NODETAB_GETALL = MSG_DSYS + 0x0b; // -
export const MSG_NODETAB_GETNEXT = MSG_DSYS + 0x0c; // -
export const MSG_NODE_CHANGED_ACK = MSG_DSYS + 0x0d; // 1:nodetab_version
export const MSG_SYS_GET_ERROR = MSG_DSYS + 0x0e; // -
export const MSG_FW_UPDATE_OP = MSG_DSYS + 0x0f; // 1:opcode, 2..n parameters

//-- feature and user config messages
export const MSG_DFC = MSG_DSTRM + 0x10;
export const MSG_FEATURE_GETALL = MSG_DFC + 0x00; // -
export const MSG_FEATURE_GETNEXT = MSG_DFC + 0x01; // -
export const MSG_FEATURE_GET = MSG_DFC + 0x02; // 1:feature_num
export const MSG_FEATURE_SET = MSG_DFC + 0x03; // 1:feature_num, 2:feature_val
export const MSG_VENDOR_ENABLE = MSG_DFC + 0x04; // 1-7: unique-id of node
export const MSG_VENDOR_DISABLE = MSG_DFC + 0x05; // -
export const MSG_VENDOR_SET = MSG_DFC + 0x06; // V_NAME,V_VALUE
export const MSG_VENDOR_GET = MSG_DFC + 0x07; // V_NAME
export const MSG_SYS_CLOCK = MSG_DFC + 0x08; //*// 1:TCODE0, 2:TCODE1, 3:TCODE2, 4:TCODE3
export const MSG_STRING_GET = MSG_DFC + 0x09; // 1:Nspace, 2:ID
export const MSG_STRING_SET = MSG_DFC + 0x0a; // 1:Nspace, 2:ID, 3:Strsize, 4...n: string

//-- occupancy messages
export const MSG_DBM = MSG_DSTRM + 0x20;
export const MSG_BM_GET_RANGE = MSG_DBM + 0x00; // 1:start, 2:end
export const MSG_BM_MIRROR_MULTIPLE = MSG_DBM + 0x01; // 1:start, 2:size, 3..n:data
export const MSG_BM_MIRROR_OCC = MSG_DBM + 0x02; // 1:mnum
export const MSG_BM_MIRROR_FREE = MSG_DBM + 0x03; // 1:mnum
export const MSG_BM_ADDR_GET_RANGE = MSG_DBM + 0x04; // 1:start, 2:end
export const MSG_BM_GET_CONFIDENCE = MSG_DBM + 0x05; // -
export const MSG_BM_MIRROR_POSITION = MSG_DBM + 0x06; // 1:addr_l, 2:addr_h, 3:type, 4:location_id_l, 5:location_id_h

//-- booster messages
export const MSG_DBST = MSG_DSTRM + 0x30;
export const MSG_BOOST_OFF = MSG_DBST + 0x00; //*// 1:unicast
export const MSG_BOOST_ON = MSG_DBST + 0x01; //*// 1:unicast
export const MSG_BOOST_QUERY = MSG_DBST + 0x02; // -

//-- accessory control messages
export const MSG_DACC = MSG_DSTRM + 0x38;
export const MSG_ACCESSORY_SET = MSG_DACC + 0x00; // 1:anum, 2:aspect
export const MSG_ACCESSORY_GET = MSG_DACC + 0x01; // 1:anum
export const MSG_ACCESSORY_PARA_SET = MSG_DACC + 0x02; // 1:anum, 2:para_num, 3..n: data
export const MSG_ACCESSORY_PARA_GET = MSG_DACC + 0x03; // 1:anum, 2:para_num

//-- switch/light/servo control messages
export const MSG_DLC = MSG_DSTRM + 0x3f;
export const MSG_LC_PORT_QUERY_ALL = MSG_DLC + 0x00; // 1:selL, 2:selH, [3:startL, 4:startH, 5:endL, 6:endH]
export const MSG_LC_OUTPUT = MSG_DLC + 0x01; // 1,2:port, 3:state
export const MSG_LC_CONFIG_SET = MSG_DLC + 0x02; // (deprecated) 1:type, 2:num, 3:off_val, 4:on_val, 5:dimm_off, 6:dimm_on
export const MSG_LC_CONFIG_GET = MSG_DLC + 0x03; // (deprecated) 1:type, 2:num
export const MSG_LC_KEY_QUERY = MSG_DLC + 0x04; // (deprecated) 1:num
export const MSG_LC_OUTPUT_QUERY = MSG_DLC + 0x05; // (deprecated) 1,2:port
export const MSG_LC_PORT_QUERY = MSG_DLC + 0x05; // 1,2:port
export const MSG_LC_CONFIGX_GET_ALL = MSG_DLC + 0x06; // [1:startL, 2:startH, 3:endL, 4:endH]
export const MSG_LC_CONFIGX_SET = MSG_DLC + 0x07; // 1,2:port, [3:p_enum, 4:p_val]  (up to 16)
export const MSG_LC_CONFIGX_GET = MSG_DLC + 0x08; // 1,2:port

//-- macro messages
export const MSG_DMAC = MSG_DSTRM + 0x48;
export const MSG_LC_MACRO_HANDLE = MSG_DMAC + 0x00; // 1:macro, 2:opcode
export const MSG_LC_MACRO_SET = MSG_DMAC + 0x01; // 1:macro, 2:item, 3:delay, 4:lstate, 5:lvalue, 6:0 / 4:port[0], 5:port[1], 6:portstat
export const MSG_LC_MACRO_GET = MSG_DMAC + 0x02; // 1:macro, 2:item
export const MSG_LC_MACRO_PARA_SET = MSG_DMAC + 0x03; // 1:macro, 2:para_idx, 3,4,5,6:value
export const MSG_LC_MACRO_PARA_GET = MSG_DMAC + 0x04; // 1:macro, 2:para_idx

//-- dcc gen messages
export const MSG_DGEN = MSG_DSTRM + 0x60;
export const MSG_CS_ALLOCATE = MSG_DGEN + 0x00;
export const MSG_CS_SET_STATE = MSG_DGEN + 0x02; // 1:state
export const MSG_CS_DRIVE = MSG_DGEN + 0x04; // 1:addrl, 2:addrh, 3:format, 4:active, 5:speed, 6:1-4, 7:5-12, 8:13-20, 9:21-28
export const MSG_CS_ACCESSORY = MSG_DGEN + 0x05; // 1:addrl, 2:addrh, 3:data(aspect), 4:time_l, 5:time_h
export const MSG_CS_BIN_STATE = MSG_DGEN + 0x06; // 1:addrl, 2:addrh, 3:bin_statl, 4:bin_stath
export const MSG_CS_POM = MSG_DGEN + 0x07; // 1..4:addr/did, 5:MID, 6:opcode, 7:cv_l, 8:cv_h, 9:cv_x, 10..13: data
export const MSG_CS_RCPLUS = MSG_DGEN + 0x08; // 1:opcode, [2..n:parameter]

//-- service mode
export const MSG_CS_PROG = MSG_DGEN + 0x0f; // 1:opcode, 2:cv_l, 3:cv_h, 4: data

//-- local message
export const MSG_DLOCAL = MSG_DSTRM + 0x70; // only locally used
export const MSG_LOGON_ACK = MSG_DLOCAL + 0x00; // 1:node_addr, 2..8:unique_id
export const MSG_LOCAL_PING = MSG_DLOCAL + 0x01;
export const MSG_LOGON_REJECTED = MSG_DLOCAL + 0x02; // 1..7:unique_id
export const MSG_LOCAL_ACCESSORY = MSG_DLOCAL + 0x03; //*// 1:statusflag, 2,3: DCC-accessory addr
export const MSG_LOCAL_SYNC = MSG_DLOCAL + 0x04; //*// 1:time_l, 2:time_h

//===============================================================================
//
// 2. Defines for Upstream Messages
//
//===============================================================================

export const MSG_USTRM = 0x80;

//-- system messages
export const MSG_USYS = MSG_USTRM + 0x00;
export const MSG_SYS_MAGIC = MSG_USYS + 0x01; // 1:0xFE 2:0xAF
export const MSG_SYS_PONG = MSG_USYS + 0x02; // 1:mirrored dat
export const MSG_SYS_P_VERSION = MSG_USYS + 0x03; // 1:proto-ver_l, 2:proto-ver_h
export const MSG_SYS_UNIQUE_ID = MSG_USYS + 0x04; // 1:class, 2:classx, 3:vid, 4..7:pid+uid, [7..11: config_fingerprint]
export const MSG_SYS_SW_VERSION = MSG_USYS + 0x05; // 1:sw-ver_l, 2:sw_-ver_h, 3:sw-ver_u
export const MSG_SYS_ERROR = MSG_USYS + 0x06; // 1:err_code, 2:msg
export const MSG_SYS_IDENTIFY_STATE = MSG_USYS + 0x07; // 1:state
export const MSG_NODETAB_COUNT = MSG_USYS + 0x08; // 1:length
export const MSG_NODETAB = MSG_USYS + 0x09; // 1:version, 2:local num, 3..9: unique
export const MSG_PKT_CAPACITY = MSG_USYS + 0x0a; // 1:capacity
export const MSG_NODE_NA = MSG_USYS + 0x0b; // 1:node
export const MSG_NODE_LOST = MSG_USYS + 0x0c; // 1:node
export const MSG_NODE_NEW = MSG_USYS + 0x0d; // 1:version, 2:local num, 3..9: unique
export const MSG_STALL = MSG_USYS + 0x0e; // 1:state
export const MSG_FW_UPDATE_STAT = MSG_USYS + 0x0f; // 1:stat, 2:timeout

//-- feature and user config messages
export const MSG_UFC = MSG_USTRM + 0x10;
export const MSG_FEATURE = MSG_UFC + 0x00; // 1:feature_num, 2:data
export const MSG_FEATURE_NA = MSG_UFC + 0x01; // 1:feature_num
export const MSG_FEATURE_COUNT = MSG_UFC + 0x02; // 1:count
export const MSG_VENDOR = MSG_UFC + 0x03; // 1..n: length,'string',length,'value'
export const MSG_VENDOR_ACK = MSG_UFC + 0x04; // 1:mode
export const MSG_STRING = MSG_UFC + 0x05; // 1:namespace, 2:id, 3:stringsize, 4...n: string

//-- occupancy and bidi-detection messages
export const MSG_UBM = MSG_USTRM + 0x20;
export const MSG_BM_OCC = MSG_UBM + 0x00; // 1:mnum, [2,3:time_l, time_h]
export const MSG_BM_FREE = MSG_UBM + 0x01; // 1:mnum
export const MSG_BM_MULTIPLE = MSG_UBM + 0x02; // 1:base, 2:size; 3..n:data
export const MSG_BM_ADDRESS = MSG_UBM + 0x03; // 1:mnum, [2,3:addr_l, addr_h]
export const MSG_BM_ACCESSORY = MSG_UBM + 0x04; // (reserved, do not use yet) 1:mnum, [2,3:addr_l, addr_h]
export const MSG_BM_CV = MSG_UBM + 0x05; // 1:addr_l, 2:addr_h, 3:cv_addr_l, 4:cv_addr_h, 5:cv_dat
export const MSG_BM_SPEED = MSG_UBM + 0x06; // 1:addr_l, 2:addr_h, 3:speed_l, 4:speed_h (from loco)
export const MSG_BM_CURRENT = MSG_UBM + 0x07; // 1:mnum, 2:current
export const MSG_BM_BLOCK_CV = MSG_UBM + 0x08; // (deprecated) 1:decvid, 2..5:decuid, 6:offset, 7:idxl, 8:idxh, 9..12:data
export const MSG_BM_XPOM = MSG_UBM + 0x08; // 1..4:addr/did, 5:0/vid, 6:opcode, 7:cv_l, 8:cv_h, 9:cv_x, 10[..13]: data
export const MSG_BM_CONFIDENCE = MSG_UBM + 0x09; // 1:void, 2:freeze, 3:nosignal
export const MSG_BM_DYN_STATE = MSG_UBM + 0x0a; // 1:mnum, 2:addr_l, 3:addr_h, 4:dyn_num, 5:value (from loco)
export const MSG_BM_RCPLUS = MSG_UBM + 0x0b; // 1:mnum, 2:opcode, [3..n:parameter]
export const MSG_BM_POSITION = MSG_UBM + 0x0c; // 1:addr_l, 2:addr_h, 3:type, 4:location_id_l, 5:location_id_h

//-- booster messages
export const MSG_UBST = MSG_USTRM + 0x30;
export const MSG_BOOST_STAT = MSG_UBST + 0x00; // 1:state (see defines below)
export const MSG_BOOST_CURRENT = MSG_UBST + 0x01; // (deprecated by DIAGNOSTIC with V0.10) 1:current
export const MSG_BOOST_DIAGNOSTIC = MSG_UBST + 0x02; // [1:enum, 2:value],[3:enum, 4:value] ...
//                              (MSG_UBST + 0x03)       // was reserved for MSG_NEW_DECODER (deprecated) 1:mnum, 2: dec_vid, 3..6:dec_uid
//                              (MSG_UBST + 0x04)       // was reserved for MSG_ID_SEARCH_ACK (deprecated) 1:mnum, 2: s_vid, 3..6:s_uid[0..3], 7: dec_vid, 8..11:dec_uid
//                              (MSG_UBST + 0x05)       // was reserved for MSG_ADDR_CHANGE_ACK (deprecated) 1:mnum, 2: dec_vid, 3..6:dec_uid, 7:addr_l, 8:addr_h

//-- accessory control messages
export const MSG_UACC = MSG_USTRM + 0x38;
export const MSG_ACCESSORY_STATE = MSG_UACC + 0x00; // 1:anum, 2:aspect, 3:total, 4:execute, 5:wait, [6..n:details] (Quittung)
export const MSG_ACCESSORY_PARA = MSG_UACC + 0x01; // 1:anum, 2:para_num, 3..n: data
export const MSG_ACCESSORY_NOTIFY = MSG_UACC + 0x02; // 1:anum, 2:aspect, 3:total, 4:execute, 5:wait, [6..n:details] (Spontan)

//-- switch/light control messages
export const MSG_ULC = MSG_USTRM + 0x40;
export const MSG_LC_STAT = MSG_ULC + 0x00; // 1,2:port, 3:state
export const MSG_LC_NA = MSG_ULC + 0x01; // 1,2:port, [3:errcause]
export const MSG_LC_CONFIG = MSG_ULC + 0x02; // (deprecated) 1:type, 2:num, 3:off_val, 4:on_val, 5:dimm_off, 6:dimm_on
export const MSG_LC_KEY = MSG_ULC + 0x03; // (deprecated) 1:num, 2:state
export const MSG_LC_WAIT = MSG_ULC + 0x04; // 1,2:port, 3:time
//                              (MSG_ULC + 0x05)        was reserved for MGS_LC_MAPPING (deprecated)
export const MSG_LC_CONFIGX = MSG_ULC + 0x06; // 1,2:port, [3:p_enum, 4:p_val]  (up to 16)

//-- macro messages
export const MSG_UMAC = MSG_USTRM + 0x48;
export const MSG_LC_MACRO_STATE = MSG_UMAC + 0x00; // 1:macro, 2:opcode
export const MSG_LC_MACRO = MSG_UMAC + 0x01; // 1:macro, 2:item, 3:delay, 4:lstate, 5:lvalue, 6:0 / 4:port[0], 5:port[1], 6:portstat
export const MSG_LC_MACRO_PARA = MSG_UMAC + 0x02; // 1:macro, 2:para_idx, 3,4,5,6:value

//-- dcc control messages
export const MSG_UGEN = MSG_USTRM + 0x60;
export const MSG_CS_ALLOC_ACK = MSG_UGEN + 0x00; // noch genauer zu klaeren / to be specified
export const MSG_CS_STATE = MSG_UGEN + 0x01;
export const MSG_CS_DRIVE_ACK = MSG_UGEN + 0x02;
export const MSG_CS_ACCESSORY_ACK = MSG_UGEN + 0x03; // 1:addrl, 2:addrh, 3:ack
export const MSG_CS_POM_ACK = MSG_UGEN + 0x04; // 1:addrl, 2:addrh, 3:addrxl, 4:addrxh, 5:mid, 6:ack
export const MSG_CS_DRIVE_MANUAL = MSG_UGEN + 0x05; // 1:addrl, 2:addrh, 3:format, 4:active, 5:speed, 6:1-4, 7:5-12, 8:13-20, 9:21-28
export const MSG_CS_DRIVE_EVENT = MSG_UGEN + 0x06; // 1:addrl, 2:addrh, 3:eventtype, Parameters
export const MSG_CS_ACCESSORY_MANUAL = MSG_UGEN + 0x07; // 1:addrl, 2:addrh, 3:ack
export const MSG_CS_RCPLUS_ACK = MSG_UGEN + 0x08; // 1:opcode, [2..n:parameter]

//-- service mode
export const MSG_CS_PROG_STATE = MSG_UGEN + 0x0f; // 1: state, 2:time, 3:cv_l, 4:cv_h, 5:data

//-- local message
export const MSG_ULOCAL = MSG_USTRM + 0x70; // only locally used
export const MSG_LOGON = MSG_ULOCAL + 0x00;
export const MSG_LOCAL_PONG = MSG_ULOCAL + 0x01; // only locally used

// //===============================================================================
// //
// // 4. Feature Codes
// //
// //===============================================================================

// //-- occupancy
// #define FEATURE_BM_SIZE                     0   // number of occupancy detectors
// #define FEATURE_BM_ON                       1   // occupancy detection on/off
// #define FEATURE_BM_SECACK_AVAILABLE         2   // secure ack available
// #define FEATURE_BM_SECACK_ON                3   // secure ack on/off
// #define FEATURE_BM_CURMEAS_AVAILABLE        4   // occupancy detectors with current measurement results
// #define FEATURE_BM_CURMEAS_INTERVAL         5   // interval for current measurements
// #define FEATURE_BM_DC_MEAS_AVAILABLE        6   // (dc) measurements available, even if track voltage is off
// #define FEATURE_BM_DC_MEAS_ON               7   // dc measurement enabled
// #define FEATURE_BM_ADDR_DETECT_AVAILABLE    8   // detector ic capable to detect loco address
// #define FEATURE_BM_ADDR_DETECT_ON           9   // address detection enabled
// //-- bidi detection
// #define FEATURE_BM_ADDR_AND_DIR            10   // addresses contain direction
// #define FEATURE_BM_ISTSPEED_AVAILABLE      11   // speed messages available
// #define FEATURE_BM_ISTSPEED_INTERVAL       12   // speed update interval
// #define FEATURE_BM_CV_AVAILABLE            13   // CV readback available
// #define FEATURE_BM_CV_ON                   14   // CV readback enabled
// //-- booster
// #define FEATURE_BST_VOLT_ADJUSTABLE        15   // booster output voltage is adjustable
// #define FEATURE_BST_VOLT                   16   // booster output voltage setting (unit: V)
// #define FEATURE_BST_CUTOUT_AVAIALABLE      17   // booster can do cutout for railcom
// #define FEATURE_BST_CUTOUT_ON              18   // cutout is enabled
// #define FEATURE_BST_TURNOFF_TIME           19   // time in ms until booster turns off in case of a short (unit 2ms)
// #define FEATURE_BST_INRUSH_TURNOFF_TIME    20   // time in ms until booster turns off in case of a short after the first power up (unit 2ms)
// #define FEATURE_BST_AMPERE_ADJUSTABLE      21   // booster output current is adjustable
// #define FEATURE_BST_AMPERE                 22   // booster output current value (special coding)
// #define FEATURE_BST_CURMEAS_INTERVAL       23   // current update interval
// #define FEATURE_BST_CV_AVAILABLE           24   // (deprecated, now synonym to 13) CV readback available
// #define FEATURE_BST_CV_ON                  25   // (deprecated, now synonym to 14) CV readback enabled
// #define FEATURE_BST_INHIBIT_AUTOSTART      26   // 1: Booster does no automatic BOOST_ON when DCC at input wakes up.
// #define FEATURE_BST_INHIBIT_LOCAL_ONOFF    27   // 1: Booster announces local STOP/GO key stroke only, no local action

// //-- bidi detection
// #define FEATURE_BM_DYN_STATE_INTERVAL      28   // transmit interval of MSG_BM_DYN_STATE (unit 100ms)
// #define FEATURE_BM_RCPLUS_AVAILABLE        29   // 1: RailcomPlus messages available
// //-- occupancy
// #define FEATURE_BM_TIMESTAMP_ON            30   // 1: OCC will be sent with timestamp
// //-- bidi detection
// #define FEATURE_BM_POSITION_ON             31   // position messages enabled
// #define FEATURE_BM_POSITION_SECACK         32   // secure position ack interval (unit: 10ms), 0: none

// //-- accessory
// #define FEATURE_ACCESSORY_COUNT            40   // number of objects
// #define FEATURE_ACCESSORY_SURVEILLED       41   // 1: announce if operated outside bidib
// #define FEATURE_ACCESSORY_MACROMAPPED      42   // 1..n: no of accessory aspects are mapped to macros

// //-- control
// #define FEATURE_CTRL_INPUT_COUNT           50   // number of inputs for keys
// #define FEATURE_CTRL_INPUT_NOTIFY          51   // 1: report a keystroke to host
// #define FEATURE_CTRL_SWITCH_COUNT          52   // number of switch ports (direct controlled)
// #define FEATURE_CTRL_LIGHT_COUNT           53   // number of light ports (direct controlled)
// #define FEATURE_CTRL_SERVO_COUNT           54   // number of servo ports (direct controlled)
// #define FEATURE_CTRL_SOUND_COUNT           55   // number of sound ports (direct controlled)
// #define FEATURE_CTRL_MOTOR_COUNT           56   // number of motor ports (direct controlled)
// #define FEATURE_CTRL_ANALOGOUT_COUNT       57   // number of analog ports (direct controlled)
// #define FEATURE_CTRL_STRETCH_DIMM          58   // additional time stretch for dimming (for light ports)
// #define FEATURE_CTRL_BACKLIGHT_COUNT       59   // number of backlight ports (intensity direct controlled)
// #define FEATURE_CTRL_MAC_LEVEL             60   // supported macro level
// #define FEATURE_CTRL_MAC_SAVE              61   // number of permanent storage places for macros
// #define FEATURE_CTRL_MAC_COUNT             62   // number of macros
// #define FEATURE_CTRL_MAC_SIZE              63   // length of each macro (entries)
// #define FEATURE_CTRL_MAC_START_MAN         64   // (local) manual control of macros enabled
// #define FEATURE_CTRL_MAC_START_DCC         65   // (local) dcc control of macros enabled
// #define FEATURE_CTRL_PORT_QUERY_AVAILABLE  66   // 1: node will answer to output queries via MSG_LC_PORT_QUERY
// #define FEATURE_SWITCH_CONFIG_AVAILABLE    67   // (deprecated, version >= 0.6 uses availability of PCFG_IO_CTRL) 1: node has possibility to configure switch ports
// #define FEATURE_CTRL_PORT_FLAT_MODEL       70   // node uses flat port model, "low" number of addressable ports
// #define FEATURE_CTRL_PORT_FLAT_MODEL_EXTENDED 71 // node uses flat port model, "high" number of addressable ports
// /* deprecated names (as of revision 1.24), do not use */
// #define FEATURE_CTRL_SPORT_COUNT           52   // (deprecated)
// #define FEATURE_CTRL_LPORT_COUNT           53   // (deprecated)
// #define FEATURE_CTRL_ANALOG_COUNT          57   // (deprecated)
// #define FEATURE_SPORT_CONFIG_AVAILABLE     67   // (deprecated)

// //-- dcc gen
// #define FEATURE_GEN_SPYMODE                100  // 1: watch bidib handsets
// #define FEATURE_GEN_WATCHDOG               101  // 0: no watchdog, 1: permanent update of MSG_CS_SET_STATE required, unit 100ms
// #define FEATURE_GEN_DRIVE_ACK              102  // not used
// #define FEATURE_GEN_SWITCH_ACK             103  // not used
// #define FEATURE_GEN_LOK_DB_SIZE            104  //
// #define FEATURE_GEN_LOK_DB_STRING          105  //
// #define FEATURE_GEN_POM_REPEAT             106  // supported service modes
// #define FEATURE_GEN_DRIVE_BUS              107  // 1: this node drive the dcc bus.
// #define FEATURE_GEN_LOK_LOST_DETECT        108  // 1: command station annouces lost loco
// #define FEATURE_GEN_NOTIFY_DRIVE_MANUAL    109  // 1: dcc gen reports manual operation
// #define FEATURE_GEN_START_STATE            110  // 1: power up state, 0=off, 1=on
// #define FEATURE_GEN_RCPLUS_AVAILABLE       111  // 1: supports rcplus messages

// #define FEATURE_STRING_SIZE                252  // length of user strings, 0:n.a (default); allowed 8..24
// #define FEATURE_RELEVANT_PID_BITS          253  // how many bits of 'vendor32' are relevant for PID (default 16, LSB aligned)
// #define FEATURE_FW_UPDATE_MODE             254  // 0: no fw-update, 1: intel hex (max. 10 byte / record)
// #define FEATURE_EXTENSION                  255  // 1: reserved for future expansion

//===============================================================================
//
// 5. Error Codes
//
//===============================================================================
//
// a) general error codes
export const BIDIB_ERR_NONE = 0x00; // void
export const BIDIB_ERR_TXT = 0x01; // general text error, 1..n byte characters
export const BIDIB_ERR_CRC = 0x02; // received crc was errornous, 1 byte with msg num
export const BIDIB_ERR_SIZE = 0x03; // missing parameters, 1 byte with msg num
export const BIDIB_ERR_SEQUENCE = 0x04; // sequence was wrong, 1 or 2 byte with last good and current num
export const BIDIB_ERR_PARAMETER = 0x05; // parameter out of range, 1 byte with msg num
export const BIDIB_ERR_BUS = 0x10; // Bus Fault, capacity exceeded, 1 byte fault code
export const BIDIB_ERR_ADDRSTACK = 0x11; // Address Stack, 4 bytes
export const BIDIB_ERR_IDDOUBLE = 0x12; // Double ID, 7 bytes
export const BIDIB_ERR_SUBCRC = 0x13; // Message in Subsystem had crc error, 1 byte node addr
export const BIDIB_ERR_SUBTIME = 0x14; // Message in Subsystem timed out, 1 byte node addr
export const BIDIB_ERR_SUBPAKET = 0x15; // Message in Subsystem Packet Size Error, 1..n byte node addr and data
export const BIDIB_ERR_OVERRUN = 0x16; // Message buffer in downstream overrun, messages lost.
export const BIDIB_ERR_HW = 0x20; // self test failed, 1 byte vendor error code
export const BIDIB_ERR_RESET_REQUIRED = 0x21; // reset needed (ie. due to reconfiguration)
export const BIDIB_ERR_NO_SECACK_BY_HOST = 0x30; // Occupancy message was not mirrored by host as required
//
// b) error cause (2nd parameter)
// for MSG_LC_NA
export const BIDIB_ERR_LC_PORT_NONE = 0x00; // no (more) error (internal use in nodes)
export const BIDIB_ERR_LC_PORT_GENERAL = 0x01; // unknown cause
export const BIDIB_ERR_LC_PORT_UNKNOWN = 0x02; // port not existing
export const BIDIB_ERR_LC_PORT_INACTIVE = 0x03; // port not usable
export const BIDIB_ERR_LC_PORT_EXEC = 0x04; // exec not possible
export const BIDIB_ERR_LC_PORT_BROKEN = 0x7f; // hardware failure

//===============================================================================
//
// 7. System Messages, Serial Link, BiDiBus
//
//===============================================================================

// 6.a) Serial Link

export const BIDIB_PKT_MAGIC = 0xfe; // frame delimiter for serial link
export const BIDIB_PKT_ESCAPE = 0xfd;

// 6.b) defines for BiDiBus, system messages
// (system messages are 9 bits, bit8 is set (1), bits 0..7 do have even parity)
export const BIDIBUS_SYS_MSG = 0x40; // System Part of BiDiBus

export const BIDIBUS_POWER_UPx = 0x7f; // formerly Bus Reset (now reserved)
export const BIDIBUS_POWER_UPx_par = 0xff; // formerly Bus Reset (including parity)
export const BIDIBUS_LOGON = 0x7e; // Logon Prompt
export const BIDIBUS_LOGON_par = 0x7e; // Logon Prompt (including parity)
export const BIDIBUS_BUSY = 0x7d; // Interface Busy
export const BIDIBUS_BUSY_par = 0x7d; // Interface Busy (including parity)

// from Node
export const BIDIBUS_NODE_READY = 0;
export const BIDIBUS_NODE_BUSY = 1;

// structure: {length, response size, response1, response2, ..}
const BIDIB_RESPONSE_MESSAGE_INFO = [
  //-- system messages
  [0], // 0x00
  [2, 6, MSG_SYS_MAGIC], // 0x01
  [2, 6, MSG_SYS_P_VERSION], // 0x02
  [1, 0], // 0x03
  [1, 0], // 0x04
  [2, 11, MSG_SYS_UNIQUE_ID], // 0x05
  [2, 7, MSG_SYS_SW_VERSION], // 0x06
  [2, 5, MSG_SYS_PONG], // 0x07
  [2, 5, MSG_SYS_IDENTIFY_STATE], // 0x08
  [1, 0], // 0x09
  [2, 5, MSG_PKT_CAPACITY], // 0x0A
  [2, 5, MSG_NODETAB_COUNT], // 0x0B
  [4, 13, MSG_NODETAB, MSG_NODE_NA, MSG_NODETAB_COUNT], // 0x0C
  [1, 0], // 0x0D
  [2, 10, MSG_SYS_ERROR], // 0x0E
  [2, 6, MSG_FW_UPDATE_STAT], // 0x0F

  //-- feature and user config messages
  [2, 5, MSG_FEATURE_COUNT], // 0x10
  [3, 6, MSG_FEATURE, MSG_FEATURE_NA], // 0x11
  [2, 6, MSG_FEATURE], // 0x12
  [2, 6, MSG_FEATURE], // 0x13
  [2, 5, MSG_VENDOR_ACK], // 0x14
  [2, 5, MSG_VENDOR_ACK], // 0x15
  [2, 32, MSG_VENDOR], // 0x16
  [2, 32, MSG_VENDOR], // 0x17
  [1, 0], // 0x18
  [2, 30, MSG_STRING], // 0x19
  [2, 30, MSG_STRING], // 0x1A
  [0], // 0x1B
  [0], // 0x1C
  [0], // 0x1D
  [0], // 0x1E
  [0], // 0x1F

  //-- occupancy messages
  [4, 21, MSG_BM_MULTIPLE, MSG_BM_OCC, MSG_BM_FREE], // 0x20
  [1, 0], // 0x21
  [1, 0], // 0x22
  [1, 0], // 0x23
  [1, 0], // 0x24
  [2, 7, MSG_BM_CONFIDENCE], // 0x25
  [0], // 0x26
  [0], // 0x27
  [0], // 0x28
  [0], // 0x29
  [0], // 0x2A
  [0], // 0x2B
  [0], // 0x2C
  [0], // 0x2D
  [0], // 0x2E
  [0], // 0x2F

  //-- booster messages
  [2, 5, MSG_BOOST_STAT], // 0x30
  [2, 5, MSG_BOOST_STAT], // 0x31
  [2, 5, MSG_BOOST_STAT], // 0x32
  [0], // 0x33
  [0], // 0x34
  [0], // 0x35
  [0], // 0x36
  [0], // 0x37

  //-- accessory control messages
  [2, 9, MSG_ACCESSORY_STATE], // 0x38
  [2, 9, MSG_ACCESSORY_STATE], // 0x39
  [2, 9, MSG_ACCESSORY_PARA], // 0x3A
  [2, 9, MSG_ACCESSORY_PARA], // 0x3B
  [0], // 0x3C
  [0], // 0x3D
  [0], // 0x3E

  //-- switch/light/servo control messages
  [1, 0], // 0x3F
  [3, 7, MSG_LC_STAT, MSG_LC_NA], // 0x40
  [3, 10, MSG_LC_CONFIG, MSG_LC_NA], // 0x41
  [3, 10, MSG_LC_CONFIG, MSG_LC_NA], // 0x42
  [3, 6, MSG_LC_KEY, MSG_LC_NA], // 0x43
  [3, 7, MSG_LC_STAT, MSG_LC_NA], // 0x44
  [1, 0], // 0x45
  [2, 40, MSG_LC_CONFIGX], // 0x46
  [2, 40, MSG_LC_CONFIGX], // 0x47

  //-- macro messages
  [2, 6, MSG_LC_MACRO_STATE], // 0x48
  [2, 10, MSG_LC_MACRO], // 0x49
  [2, 10, MSG_LC_MACRO], // 0x4A
  [2, 10, MSG_LC_MACRO_PARA], // 0x4B
  [2, 10, MSG_LC_MACRO_PARA], // 0x4C
  [0], // 0x4D
  [0], // 0x4E
  [0], // 0x4F
  [0], // 0x50
  [0], // 0x51
  [0], // 0x52
  [0], // 0x53
  [0], // 0x54
  [0], // 0x55
  [0], // 0x56
  [0], // 0x57
  [0], // 0x58
  [0], // 0x59
  [0], // 0x5A
  [0], // 0x5B
  [0], // 0x5C
  [0], // 0x5D
  [0], // 0x5E
  [0], // 0x5F

  //-- dcc gen messages
  [1, 0], // 0x60
  [0], // 0x61
  [2, 5, MSG_CS_STATE], // 0x62
  [0], // 0x63
  [2, 7, MSG_CS_DRIVE_ACK], // 0x64
  [2, 7, MSG_CS_ACCESSORY_ACK], // 0x65
  [2, 7, MSG_CS_DRIVE_ACK], // 0x66
  [2, 10, MSG_CS_POM_ACK], // 0x67
  [2, 11, MSG_CS_RCPLUS_ACK], // 0x68
  [0], // 0x69
  [0], // 0x6A
  [0], // 0x6B
  [0], // 0x6C
  [0], // 0x6D
  [0], // 0x6E
  [2, 5, MSG_CS_PROG_STATE], // 0x6F
  [0], // 0x70
  [0], // 0x71
  [0], // 0x72
  [0], // 0x73
  [0], // 0x74
  [0], // 0x75
  [0], // 0x76
  [0], // 0x77
  [0], // 0x78
  [0], // 0x79
  [0], // 0x7A
  [0], // 0x7B
  [0], // 0x7C
  [0], // 0x7D
  [0], // 0x7E
  [0], // 0x7F
];
