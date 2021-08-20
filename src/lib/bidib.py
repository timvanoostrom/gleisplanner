#!/usr/bin/python3

# formats the output of interceptty as bidib-messages

import sys
from datetime import datetime
import math

upstr   = '' # Interface --> Host
downstr = '' # Host --> Interface

features = { 0 : 'FEATURE_BM_SIZE',
             1 : 'FEATURE_BM_ON',
             2 : 'FEATURE_BM_SECACK_AVAILABLE',
             3 : 'FEATURE_BM_SECACK_ON',
             4 : 'FEATURE_BM_CURMEAS_AVAILABLE',
             5 : 'FEATURE_BM_CURMEAS_INTERVAL',
             6 : 'FEATURE_BM_DC_MEAS_AVAILABLE',
             7 : 'FEATURE_BM_DC_MEAS_ON',
             8 : 'FEATURE_BM_ADDR_DETECT_AVAILABLE',
             9 : 'FEATURE_BM_ADDR_DETECT_ON',
            10 : 'FEATURE_BM_ADDR_AND_DIR',
            11 : 'FEATURE_BM_ISTSPEED_AVAILABLE',
            12 : 'FEATURE_BM_ISTSPEED_INTERVAL',
            13 : 'FEATURE_BM_CV_AVAILABLE',
            14 : 'FEATURE_BM_CV_ON',
            15 : 'FEATURE_BST_VOLT_ADJUSTABLE',
            16 : 'FEATURE_BST_VOLT',
            17 : 'FEATURE_BST_CUTOUT_AVAIALABLE',
            18 : 'FEATURE_BST_CUTOUT_ON',
            19 : 'FEATURE_BST_TURNOFF_TIME',
            20 : 'FEATURE_BST_INRUSH_TURNOFF_TIME',
            21 : 'FEATURE_BST_AMPERE_ADJUSTABLE',
            22 : 'FEATURE_BST_AMPERE',
            23 : 'FEATURE_BST_CURMEAS_INTERVAL',
            26 : 'FEATURE_BST_INHIBIT_AUTOSTART',
            27 : 'FEATURE_BST_INHIBIT_LOCAL_ONOFF',
            28 : 'FEATURE_BM_DYN_STATE_INTERVAL',
            29 : 'FEATURE_BM_RCPLUS_AVAILABLE',
            30 : 'FEATURE_BM_TIMESTAMP_ON',
            31 : 'FEATURE_BM_POSITION_ON',
            32 : 'FEATURE_BM_POSITION_SECACK',
            40 : 'FEATURE_ACCESSORY_COUNT',
            41 : 'FEATURE_ACCESSORY_SURVEILLED',
            42 : 'FEATURE_ACCESSORY_MACROMAPPED',
            50 : 'FEATURE_CTRL_INPUT_COUNT',
            51 : 'FEATURE_CTRL_INPUT_NOTIFY',
            52 : 'FEATURE_CTRL_SWITCH_COUNT',
            53 : 'FEATURE_CTRL_LIGHT_COUNT',
            54 : 'FEATURE_CTRL_SERVO_COUNT',
            60 : 'FEATURE_CTRL_MAC_LEVEL',
            61 : 'FEATURE_CTRL_MAC_SAVE',
            62 : 'FEATURE_CTRL_MAC_COUNT',
            63 : 'FEATURE_CTRL_MAC_SIZE',
            64 : 'FEATURE_CTRL_MAC_START_MAN',
            65 : 'FEATURE_CTRL_MAC_START_DCC',
            66 : 'FEATURE_CTRL_PORT_QUERY_AVAILABLE',
            70 : 'FEATURE_CTRL_PORT_FLAT_MODEL',
            71 : 'FEATURE_CTRL_PORT_FLAT_MODEL_EXTENDED',
           100 : 'FEATURE_GEN_SPYMODE',
           101 : 'FEATURE_GEN_WATCHDOG',
           102 : 'FEATURE_GEN_DRIVE_ACK',
           103 : 'FEATURE_GEN_SWITCH_ACK',
           106 : 'FEATURE_GEN_POM_REPEAT',
           107 : 'FEATURE_GEN_DRIVE_BUS',
           108 : 'FEATURE_GEN_LOK_LOST_DETECT',
           109 : 'FEATURE_GEN_NOTIFY_DRIVE_MANUAL',
           110 : 'FEATURE_GEN_START_STATE',
           111 : 'FEATURE_GEN_RCPLUS_AVAILABLE',
           252 : 'FEATURE_STRING_SIZE',
           254 : 'FEATURE_FW_UPDATE_MODE',
           255 : 'FEATURE_EXTENSION'                  }

booststate = {	0x00 : 'BIDIB_BST_STATE_OFF',
        	0x01 : 'BIDIB_BST_STATE_OFF_SHORT',
        	0x02 : 'BIDIB_BST_STATE_OFF_HOT',
        	0x03 : 'BIDIB_BST_STATE_OFF_NOPOWER',
        	0x04 : 'BIDIB_BST_STATE_OFF_GO_REQ',
        	0x05 : 'BIDIB_BST_STATE_OFF_HERE',
        	0x06 : 'BIDIB_BST_STATE_OFF_NO_DCC',
        	0x80 : 'BIDIB_BST_STATE_ON',
        	0x81 : 'BIDIB_BST_STATE_ON_LIMIT',
        	0x82 : 'BIDIB_BST_STATE_ON_HOT',
        	0x83 : 'BIDIB_BST_STATE_ON_STOP_REQ',
        	0x84 : 'BIDIB_BST_STATE_ON_HERE'       }

csstate = { 0x00 : 'BIDIB_CS_STATE_OFF',
            0x01 : 'BIDIB_CS_STATE_STOP',
            0x02 : 'BIDIB_CS_STATE_SOFTSTOP',
            0x03 : 'BIDIB_CS_STATE_GO',
            0x04 : 'BIDIB_CS_STATE_GO_IGN_WD',
            0x08 : 'BIDIB_CS_STATE_PROG',
            0x09 : 'BIDIB_CS_STATE_PROGBUSY',
            0x0D : 'BIDIB_CS_STATE_BUSY',
            0xFF : 'BIDIB_CS_STATE_QUERY'      }

def MSG_FEATURE_GET(b): # b Bytearray
    f = features[b[0]]
    return '0x12 MSG_FEATURE_GET '+f

def MSG_FEATURE_SET(b):
    f = features[b[0]]
    v = str(b[1])
    return '0x13 MSG_FEATURE_SET '+f+' '+v

def MSG_SYS_CLOCK(b):
    wt = {0 : 'Montag', 1 : 'Dienstag', 2 : 'Mittwoch', 3 : 'Donnerstag', 4 : 'Freitag', 5 : 'Samstag', 6 : 'Sonntag'}
    t = '{0:02d}:{1:02d}'.format(b[1]-128,b[0])
    w = wt[b[2]-64]
    f = str(b[3]-192)
    return '0x18 MSG_SYS_CLOCK '+t+', '+w+', '+f

def MSG_STRING_GET(b):
    nspace  = str(b[0])
    ID      = str(b[1])
    return '0x19 MSG_STRING_GET '+nspace+' '+ID

def MSG_BM_GET_RANGE(b):
    start = str(b[0])
    end   = str(b[1])
    return '0x20 MSG_BM_GET_RANGE '+start+' '+end

def MSG_BM_MIRROR_MULTIPLE(b):
    start = str(b[0])
    size  = str(b[1])
    s = ' '
    a = b[1]//8
    i = 1
    while i <= a:
        s = s + bin(b[i+1])[2:].zfill(8)+' '
        i = i + 1
    return '0x21 MSG_BM_MIRROR_MULTIPLE '+'start: '+start+' size: '+size+s

def MSG_BM_MIRROR_OCC(b):
    mnum = str(b[0])
    return '0x22 MSG_BM_MIRROR_OCC '+mnum

def MSG_BM_MIRROR_FREE(b):
    mnum = str(b[0])
    return '0x23 MSG_BM_MIRROR_FREE '+mnum

def MSG_LC_KEY_QUERY(b):
    port = str(b[0])
    return 'outdated 0x43 MSG_LC_KEY_QUERY '+port

def MSG_CS_SET_STATE(b):
    state = csstate[b[0]]
    return '0x62 MSG_CS_SET_STATE '+state

def CS_DRIVE_string(b):
    addr = str(b[1]*256+b[0])
    speedsteps = { 0 : 14, 2 : 28, 3 : 126 }
    steps = str(speedsteps[b[2]])
    activ = bin(b[3])[2:].zfill(8)[-6:]
    operation = { 0 : 'rev', 1 : 'fwd' }
    direc = operation[b[4]>>7]
    speed = (b[4] & 127)
    if speed == 0:
        spd = '0'
    elif speed == 1:
        spd = 'estop'
    else:
        if b[2] == 0:   # 14 steps
            spd = str(math.floor((speed-2)/9)+1)
        elif b[2] == 2: # 28 steps
            spd = str(math.floor((speed-2)*2/9)+1)
        else:            # 128 steps
            spd = str(speed-1)
    FL = (b[5] & 16)>>4     # F0 frontlight
    F4 = (b[5] & 8)>>3
    F3 = (b[5] & 4)>>2
    F2 = (b[5] & 2)>>1
    F1 = b[5] & 1
    f0_5 = str(FL)+' '+str(F4)+str(F3)+str(F2)+str(F1)
    F12 = (b[6] & 128)>>7
    F11 = (b[6] & 64)>>6
    F10 = (b[6] & 32)>>5
    F9  = (b[6] & 16)>>4
    F8  = (b[6] & 8)>>3
    F7  = (b[6] & 4)>>2
    F6  = (b[6] & 2)>>1
    F5  = b[6] & 1
    f12_5 = str(F12)+str(F11)+str(F10)+str(F9)+' '+str(F8)+str(F7)+str(F6)+str(F5)
    F20 = (b[7] & 128)>>7
    F19 = (b[7] & 64)>>6
    F18 = (b[7] & 32)>>5
    F17 = (b[7] & 16)>>4
    F16 = (b[7] & 8)>>3
    F15 = (b[7] & 4)>>2
    F14 = (b[7] & 2)>>1
    F13 = b[7] & 1
    f20_13 = str(F20)+str(F19)+str(F18)+str(F17)+' '+str(F16)+str(F15)+str(F14)+str(F13)
    F28 = (b[8] & 128)>>7
    F27 = (b[8] & 64)>>6
    F26 = (b[8] & 32)>>5
    F25 = (b[8] & 16)>>4
    F24 = (b[8] & 8)>>3
    F23 = (b[8] & 4)>>2
    F22 = (b[8] & 2)>>1
    F21 = b[8] & 1
    f28_21 = str(F28)+str(F27)+str(F26)+str(F25)+' '+str(F24)+str(F23)+str(F22)+str(F21)
    return addr+', '+steps+', '+activ+', '+direc+', '+spd+', '+f0_5+', '+f12_5+', '+f20_13+', '+f28_21

def MSG_CS_DRIVE(b):
    return '0x64 MSG_CS_DRIVE '+CS_DRIVE_string(b)

def MSG_SYS_SW_VERSION(b):
    swver_l = str(b[0])
    swver_h = str(b[1])
    swver_u = str(b[2])
    return '0x85 MSG_SYS_SW_VERSION '+swver_h+'.'+swver_l+'.'+swver_u

def MSG_NODETAB_COUNT(b):
    length = str(b[0])
    return '0x88 NODETAB_COUNT '+length

def MSG_NODETAB(b):
    version = 'version: '+str(b[0])
    local = 'local: '+str(b[1])
    classid = 'class: '+bin(b[2])[2:].zfill(8)+' '+str(b[3])
    vid = 'vid: '+hex(b[4])[2:].zfill(2)
    pid = 'pid: '+hex(b[5])[2:].zfill(2)+hex(b[6])[2:].zfill(2)+hex(b[7])[2:].zfill(2)+hex(b[8])[2:].zfill(2)
    return '0x89 MSG_NODETAB '+version+' '+local+' '+classid+' '+vid+' '+pid

def MSG_NODE_NA(b):
    node = str(b[0])
    return '0x8b MSG_NODE_NA '+'node: '+node

def MSG_FEATURE(b):
    f = features[b[0]]
    v = str(b[1])
    return '0x90 MSG_FEATURE '+f+' '+v

def MSG_FEATURE_NA(b):
    f = features[b[0]]
    return '0x91 MSG_FEATURE_NA '+f

def MSG_STRING(b):
    size = b[2]
    s = ''
    i = 3
    while i < 3+size:
        s = s + chr(b[i])
        i = i + 1
    return '0x95 MSG_STRING '+str(b[0])+' '+str(b[1])+' '+str(b[2])+" '"+s+"'"

def MSG_BM_OCC(b):
    mnum = str(b[0])
    return '0xa0 MSG_BM_OCC '+mnum

def MSG_BM_FREE(b):
    mnum = str(b[0])
    return '0xa1 MSG_BM_FREE '+mnum

def MSG_BM_MULTIPLE(b):
    start = str(b[0])
    size  = str(b[1])
    s = ' '
    a = b[1]//8
    i = 1
    while i <= a:
        s = s + bin(b[i+1])[2:].zfill(8)+' '
        i = i + 1
    return '0xa2 MSG_BM_MULTIPLE '+'start: '+start+' size: '+size+s

def MSG_BM_ADDRESS(b):
    mnum = str(b[0])
    o = { 0 : 'rev', 1 : 'fwd' }
    l = (len(b)-1)//2
    s = ''
    i = 1
    while i <= l:
        direc = o[b[i*2]>>7]
        addr = str((b[i*2] & 63)*256 + b[i*2-1])
        s = s + direc+' '+addr+' '
        i = i+1
    return '0xa3 MSG_BM_ADDRESS '+mnum+' '+s

def MSG_BM_SPEED(b):
    o = { 0 : 'rev', 1 : 'fwd' }
    direc = o[b[1]>>7]
    addr = str((b[1] & 63)*256 + b[0])
    speed = str(b[3]*256+b[2])+' km/h'
    return '0xa6 MSG_BM_SPEED '+direc+' '+addr+' speed: '+speed

def MSG_BM_CONFIDENCE(b):
    void     = str(b[0])
    freeze   = str(b[1])
    nosignal = str(b[2])
    return '0xa9 MSG_BM_CONFIDENCE '+'void: '+void+' freeze: '+freeze+' nosignal: '+nosignal

def MSG_BM_DYN_STATE(b):
    mnum = str(b[0])
    o = { 0 : 'rev', 1 : 'fwd' }
    direc = o[b[2]>>7]
    addr = str((b[2] & 63)*256 + b[1])
    dyn_num = str(b[3])
    value = str(b[4])
    return '0xaa MSG_BM_DYN_STATE '+'mnum: '+mnum+' '+direc+' '+addr+' '+dyn_num+' '+value

def MSG_BOOST_STAT(b):
    state = booststate[b[0]]
    return '0xb0 MSG_BOOST_STAT '+str(hex(b[0]))+' '+state

def MSG_BOOST_DIAGNOSTIC(b):
    if b[1] == 0:
        I = str(0)+'mA'
    elif b[1] <= 15:
        I = str(b[1])+'mA'
    elif b[1] <= 63:
        I = str((b[1]-12)*4)+'mA'
    elif b[1] <= 127:
        I = str((b[1]-51)*16)+'mA'
    elif b[1] <= 191:
        I = str((b[1]-108)*64)+'mA'
    elif b[1] <= 250:
        I = str((b[1]-171)*256)+'mA'
    elif b[1] <= 253:
        I = 'reserved'
    elif b[1] == 254:
        I = 'overcurrent'
    else:
        I = '?mA'
    if b[3] <= 250:
        V = str(b[3]*0.1)+'V'
    elif b[3] <= 254:
        V = 'reserved'
    else:
        V = '?V'
    if b[5] <= 127:
        T = str(b[5])+'°C'
    elif b[5] <= 225:
        T = 'reserved'
    else:
        T = 'Zweierkomplement?'
    return '0xb2 MSG_BOOST_DIAGNOSTIC '+I+' '+V+' '+T

def MSG_CS_STATE(b):
    state = csstate[b[0]]
    return '0xe1 MSG_CS_STATE '+state

def MSG_LC_KEY(b):
    port = str(b[0])
    kstate = str(b[1])
    return 'outdated 0xc3 MSG_LC_KEY '+port+' '+kstate

def MSG_CS_DRIVE_MANUAL(b):
    return '0xe5 MSG_CS_DRIVE_MANUAL '+CS_DRIVE_string(b)

msgtype = {0x00 : '0x00 MSG_DSYS',
           0x01 : '0x01 MSG_SYS_GET_MAGIC',
           0x02 : '0x02 MSG_SYS_GET_P_VERSION',
           0x03 : '0x03 MSG_SYS_ENABLE',
           0x04 : '0x04 MSG_SYS_DISABLE',
           0x05 : '0x05 MSG_SYS_GET_UNIQUE_ID',
           0x06 : '0x06 MSG_SYS_GET_SW_VERSION',
           0x07 : '0x07 MSG_SYS_PING',
           0x08 : '0x08 MSG_SYS_IDENTIFY',
           0x09 : '0x09 MSG_SYS_RESET',
           0x0a : '0x0a MSG_GET_PKT_ CAPACITY',
           0x0b : '0x0b MSG_NODETAB_GETALL',
           0x0c : '0x0c MSG_NODETAB_GETNEXT',
           0x0d : 'MSG_NODE_CHANGED_ACK',
           0x0e : 'MSG_SYS_GET_ERROR',
           0x0f : 'MSG_FW_UPDATE_OP',
           0x10 : 'MSG_FEATURE_GETALL',
           0x11 : '0x11 MSG_FEATURE_GETNEXT',
           0x12 :  MSG_FEATURE_GET,
           0x13 :  MSG_FEATURE_SET,
           0x14 : 'MSG_VENDOR_ENABLE',
           0x15 : 'MSG_VENDOR_DISABLE',
           0x16 : 'MSG_VENDOR_SET',
           0x17 : 'MSG_VENDOR_GET',
           0x18 :  MSG_SYS_CLOCK,
           0x19 :  MSG_STRING_GET,
           0x1a : 'MSG_STRING_SET',
           0x20 :  MSG_BM_GET_RANGE,
           0x21 :  MSG_BM_MIRROR_MULTIPLE,
           0x22 :  MSG_BM_MIRROR_OCC,
           0x23 :  MSG_BM_MIRROR_FREE,
           0x24 : '0x24 MSG_BM_ADDR_GET_RANGE',
           0x25 : '0x25 MSG_BM_GET_CONFIDENCE',
           0x30 : '0x30 MSG_BOOST_OFF',
           0x31 : '0x31 MSG_BOOST_ON',
           0x32 : '0x32 MSG_BOOST_QUERY',
           0x38 : 'MSG_ACCESSORY_SET',
           0x39 : 'MSG_ACCESSORY_GET',
           0x3a : 'MSG_ACCESSORY_PARA_SET',
           0x3b : 'MSG_ACCESSORY_PARA_GET',
           0x40 : 'MSG_LC_OUTPUT',
           0x41 : 'MSG_LC_CONFIG_SET',
           0x42 : 'MSG_LC_CONFIG_GET',
           0x43 :  MSG_LC_KEY_QUERY,
           0x44 : 'MSG_LC_OUTPUT_QUERY',
           0x45 : 'MGS_LC_MAPPING_GET',
           0x46 : 'MSG_LC_CONFIGX_SET',
           0x47 : 'MSG_LC_CONFIGX_GET',
           0x48 : 'MSG_LC_MACRO_HANDLE',
           0x49 : 'MSG_LC_MACRO_SET',
           0x4a : 'MSG_LC_MACRO_GET',
           0x4b : 'MSG_LC_MACRO_PARA_SET',
           0x4c : 'MSG_LC_MACRO_PARA_GET',
           0x60 : 'MSG_CS_ALLOCATE',
           0x62 :  MSG_CS_SET_STATE,
           0x64 :  MSG_CS_DRIVE,
           0x65 : 'MSG_CS_ACCESSORY',
           0x66 : 'MSG_CS_BIN_STATE',
           0x67 : 'MSG_CS_POM',
           0x6f : 'MSG_CS_PROG',
           0x70 : 'MSG_LOGON_ACK',
           0x71 : 'MSG_LOCAL_PING',
           0x72 : 'MSG_LOGON_REJECTED',
           0x73 : 'MSG_LOCAL_ACCESSORY',
           0x81 : '0x81 MSG_SYS_MAGIC 1:0xFE 2:0xAF',
           0x82 : 'MSG_SYS_PONG',
           0x83 : 'MSG_SYS_P_VERSION',
           0x84 : 'MSG_SYS_UNIQUE_ID',
           0x85 :  MSG_SYS_SW_VERSION,
           0x86 : 'MSG_SYS_ERROR',
           0x87 : 'MSG_SYS_IDENTIFY_STATE',
           0x88 :  MSG_NODETAB_COUNT,
           0x89 :  MSG_NODETAB,
           0x8a : 'MSG_PKT_CAPACITY',
           0x8b :  MSG_NODE_NA,
           0x8c : 'MSG_NODE_LOST',
           0x8d : 'MSG_NODE_NEW',
           0x8e : 'MSG_STALL',
           0x8f : 'MSG_FW_UPDATE_STAT',
           0x90 :  MSG_FEATURE,
           0x91 :  MSG_FEATURE_NA,
           0x92 : 'MSG_FEATURE_COUNT',
           0x93 : 'MSG_VENDOR',
           0x94 : 'MSG_VENDOR_ACK',
           0x95 :  MSG_STRING,
           0xa0 :  MSG_BM_OCC,
           0xa1 :  MSG_BM_FREE,
           0xa2 :  MSG_BM_MULTIPLE,
           0xa3 :  MSG_BM_ADDRESS,
           0xa4 : 'MSG_BM_ACCESSORY',
           0xa5 : 'MSG_BM_CV',
           0xa6 :  MSG_BM_SPEED,
           0xa7 : 'MSG_BM_CURRENT',
           0xa8 : 'MSG_BM_BLOCK_CV',
           0xa9 :  MSG_BM_CONFIDENCE,
           0xaa :  MSG_BM_DYN_STATE,
           0xb0 :  MSG_BOOST_STAT,
           0xb1 : 'MSG_BOOST_CURRENT',
           0xb2 :  MSG_BOOST_DIAGNOSTIC,
           0xb3 : 'MSG_NEW_DECODER',
           0xb4 : 'MSG_ID_SEARCH_ACK',
           0xb5 : 'MSG_ADDR_CHANGE_ACK',
           0xb8 : 'MSG_ACCESSORY_STATE',
           0xb9 : 'MSG_ACCESSORY_PARA',
           0xba : 'MSG_ACCESSORY_NOTIFY',
           0xc0 : 'MSG_LC_STAT',
           0xc1 : 'MSG_LC_NA',
           0xc2 : 'MSG_LC_CONFIG',
           0xc3 :  MSG_LC_KEY,
           0xc4 : 'MSG_LC_WAIT',
           0xc5 : 'MSG_LC_MAPPING',
           0xc6 : 'MSG_LC_CONFIGX',
           0xc8 : 'MSG_LC_MACRO_STATE',
           0xc9 : 'MSG_LC_MACRO',
           0xca : 'MSG_LC_MACRO_PARA',
           0xe0 : 'MSG_CS_ALLOC_ACK',
           0xe1 :  MSG_CS_STATE,
           0xe2 : 'e2 MSG_CS_DRIVE_ACK',
           0xe3 : 'e3 MSG_CS_ACCESSORY_ACK',
           0xe4 : 'e4 MSG_CS_POM_ACK',
           0xe5 :  MSG_CS_DRIVE_MANUAL,
           0xe6 : 'e6 MSG_CS_DRIVE_EVENT',
           0xe7 : 'e7 MSG_CS_ACCESSORY_MANUAL',
           0xef : 'ef MSG_CS_PROG_STATE',
           0xf0 : 'f0 MSG_LOGON',
           0xf1 : 'f1 MSG_LOCAL_PONG'      }

msgex = {0xa6,0xe1,0x62,0xaa} # messages excluded

def bidibmsg(s,updownstr):
    s = s.replace('fdde','fe')     # destuffing
    s = s.replace('fddd','fd')
    if s[0:2] == 'fe':             # stripping frame delimiter
        s = s[2:]
    s = s[:-2]
    packet = bytearray.fromhex(s)
    if packet[0]+2 <= len(packet): # if multiple message: s = ms[0]+..+ms[#] + rs, packet = mp[0]+..+mp[#] + rp
        ms = [s[0:2*packet[0]+2]]
        mp = [packet[0:packet[0]+1]]
        rs = s[2*packet[0]+2:]
        rp = packet[packet[0]+1:]
        while rp[0]+2 <= len(rp):      # ms, mp are arrays of the part-messages
            ms = ms+[rs[0:2*rp[0]+2]]
            mp = mp+[rp[0:rp[0]+1]]
            rs = rs[2*rp[0]+2:]
            rp = rp[rp[0]+1:]
    else:
        ms = [s]
        mp = [packet]
    msgnums = []
    outs = []
    for i in range(0,len(ms)):
        j = 0                      # looking for first zero byte, end of address-stack
        while mp[i][j] != 0:
            j = j+1
        msgnums = msgnums + [mp[i][j+2]]
        if type(msgtype[mp[i][j+2]]) == type('abc'): # value is string or function
            outs = outs+[str(datetime.now()) + updownstr + ms[i] + '  ' + msgtype[mp[i][j+2]]]
        else:
            outs = outs+[str(datetime.now()) + updownstr + ms[i] + '  ' + msgtype[mp[i][j+2]](mp[i][j+3:])]
    return (outs,msgnums)

while True:
    try:
        s = sys.stdin.readline()
    except EOFError:
        break               # ??
    if s == '':
        break
    if s[0] == '<':
        b = s[4:6]
        downstr = downstr + b
        if downstr == 'fe':
            continue        # ignore optional 'fe' at start
        if b == 'fe':
            (outs,msgnums) = bidibmsg(downstr,' < ')
            if len(outs) > 1:
                print('Multimessage:              <  '+downstr[:-2]+' ',len(outs))
            for i in range(0,len(outs)):
                if not msgnums[i] in msgex:
                    print(outs[i])
            downstr = ''
    elif s[0] == '>':
        b = s[5:7]
        upstr = upstr + b
        if upstr == 'fe':
            continue        # ignore optional 'fe' at start
        if b == 'fe':
            (outs,msgnums) = bidibmsg(upstr,' >          ')
            if len(outs) > 1:
                print('Multimessage:              >          '+upstr[:-2]+' ',len(outs))
            for i in range(0,len(outs)):
                if not msgnums[i] in msgex:
                    print(outs[i])
            upstr = ''
    else:
        print('missing < or >')
        break
