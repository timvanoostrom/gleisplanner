function findMsgID(headerReceived) {
  for (const [headerID, headerVal] of Object.entries(Z21_MSG)) {
    if (headerReceived === headerVal) {
      return headerID;
    }
  }
  return;
}

function check_data_lan_x_header(msg, rinfo) {
  const length = msg[0];
  const headerReceived = msg[2];
  const messageId = findMsgID(headerReceived);

  const z21_data_foreground = false;
  const z21_data_power = 1;

  const xpnframe = new Uint8Array(32);

  const xheader = msg[4];
  switch (xheader) {
    case 0x21:
      const db0 = msg[5];
      switch (db0) {
        case LAN_X_GET_STATUS:
          console.log('LAN_X_GET_STATUS\n');
          memcpy(xpnframe, XPN_X_STATUS_CHANGED, sizeof(XPN_X_STATUS_CHANGED));
          xpnframe[6] = z21_data_power ? 0x00 : 0x02;
          xpnframe[7] = xor(xpnframe[4], 3);
          send_xpn(xpnframe);
          console.log('LAN_X_STATUS_CHANGED');
          break;
        case LAN_X_SET_TRACK_POWER_ON:
          console.log('LAN_X_SET_TRACK_POWER_ON\n');
          z21_data_power = 1;
          send_can(MS_POWER_ON);
          break;
        case LAN_X_SET_TRACK_POWER_OFF:
          console.log('LAN_X_SET_TRACK_POWER_OFF\n');
          z21_data_power = 0;
          send_can(MS_POWER_OFF);
          break;
        default:
          console.log('LAN_X_HEADER type ?');
          break;
      }
      break;
    case LAN_X_GET_LOCO_INFO:
      console.log('LAN_X_GET_LOCO_INFO');
      if (length === 9) {
        const loco_id = be16(msg[6]) & 0x3fff;
        /* TODO */
        console.log(' LOC ID 0x%04X\n', loco_id);
        /* TODO */
        send_xpn_loco_info(m_id(loco_id));
      }
      break;
    case LAN_X_SET_LOCO:
      if (length === 0x0a) {
        const loco_id = be16(msg[6]) & 0x3fff;
        if (msg[5] === LAN_X_SET_LOCO_FUNCTION) {
          console.log(
            'LAN_X_SET_LOCO_FUNCTION 0x%04X 0x%02X\n',
            loco_id,
            msg[8]
          );
          const func = msg[8] & 0x1f;
          const switchtype = (msg[8] >> 6) & 0x03;
          if (switchtype === 2) {
            value = loco_get_function(m_id(loco_id), func) ^ 1;
          } else {
            value = switchtype;
          }
          send_can_loco_function(loco_id, func, value, z21_data_foreground);
        } else if ((msg[5] & 0xf0) === 0x10) {
          /* LAN_X_SET_LOCO_DRIVE */
          console.log('LAN_X_SET_LOCO_DRIVE 0x%04X 0x%02X\n', loco_id, msg[8]);
          const step = msg[5] & 0x03;
          const direction = msg[8] >> 7;
          const speed = msg[8] & 0x7f;
          send_can_loco_drive(
            loco_id,
            direction,
            step,
            speed,
            z21_data_foreground
          );
        }
      }
      /* LAN_X_SET_LOCO */
      break;
    case LAN_X_GET_TURNOUT_INFO:
      const FAdr = be16(msg[5]);
      if (length === 0x08) {
        console.log('LAN_X_GET_TURNOUT_INFO 0x%04X', FAdr);
      } else if (length === 0x09) {
        const zz = msg[7];
        console.log('LAN_X_TURNOUT_INFO 0x%04X 0x%02X', FAdr, zz);
        /* TODO */
        if (!zz) {
          zz = 0x01;
          console.log('\n');
          send_xpn_turnout_info(FAdr, zz);
        }
      }
      break;
    case LAN_X_SET_TURNOUT:
      const FAdr = be16(msg[5]);
      const turnout = msg[7];
      tport = turnout & 0x1;
      console.log('LAN_X_SET_TURNOUT 0x%04X\n', FAdr);
      send_can_turnout(FAdr, tport);
      break;
    case LAN_X_CV_READ:
      console.log('LAN_X_CV_READ CV %u *TODO*', be16(msg[6]));
      break;
    case LAN_X_GET_FIRMWARE_VERSION:
      console.log('LAN_X_GET_FIRMWARE_VERSION\n');
      send_xpn(XPN_X_Z21_FIRMWARE_VERSION);
      console.log(
        'LAN_X_FIRMWARE_VERSION %u.%u%u',
        XPN_X_Z21_FIRMWARE_VERSION[6],
        XPN_X_Z21_FIRMWARE_VERSION[7] >> 4,
        XPN_X_Z21_FIRMWARE_VERSION[7] & 0xf
      );
      break;
    default:
      break;
  }
}

function processMessage(msg, rinfo) {
  const length = msg[0];
  const headerReceived = msg[2];
  const messageId = findMsgID(headerReceived);

  function sendReply(reply) {
    if (reply) {
      server.send(
        new Uint8Array(XPN_SERIAL_NUMBER_RESPONSE),
        rinfo.port,
        rinfo.address,
        (error, msg) => {
          if (error) {
            console.error(error);
          } else {
            console.log('-> reply: %s', msg);
          }
        }
      );
    }
  }

  if (messageId) {
    console.log('<- msg: %s, length: %s', messageId, length);
  }

  switch (header) {
    case LAN_GET_SERIAL_NUMBER:
      if (length === 4) {
        console.log('LAN_GET_SERIAL_NUMBER\n');
        sendReply(XPN_SERIAL_NUMBER_RESPONSE);
        console.log(
          'LAN_SERIAL_NUMBER 0x%08X',
          le32(XPN_SERIAL_NUMBER_RESPONSE[4])
        );
      }
      break;
    case LAN_GET_CODE:
      console.log('LAN_GET_CODE\n');
      sendReply(XPN_GET_CODE_RESPONSE);
      console.log('LAN_GET_CODE_RESPONSE');
      break;
    case LAN_GET_HWINFO:
      if (length === 4) {
        console.log('LAN_GET_HWINFO\n');
        sendReply(XPN_HWINFO_RESPONSE);
        console.log(
          'LAN HWINFO 0x%04X %u.%u%u',
          le32(XPN_HWINFO_RESPONSE[4]),
          XPN_HWINFO_RESPONSE[9],
          XPN_HWINFO_RESPONSE[8] >> 4,
          XPN_HWINFO_RESPONSE[8] & 0xf
        );
      }
      break;
    case LAN_LOGOFF:
      console.log('LAN_LOGOFF *');
      break;
    case LAN_GET_LOCOMODE:
      console.log('LAN_GET_LOCO_MODE 0x%04X *TODO*', be16(msg[4]));
      break;
    case LAN_SET_BROADCASTFLAGS:
      flags = be32(msg[4]);
      console.log('LAN_SET_BROADCASTFLAGS 0x%08X', flags);
      break;
    case LAN_X_HEADER:
      check_data_lan_x_header(z21_data);
      break;
    case LAN_SYSTEMSTATE_GETDATA:
      console.log('LAN_SYSTEMSTATE_GETDATA\n');
      sendReply_system_info(verbose);
      break;
    case 0x12:
      if (length === 0x04) {
        console.log('LAN_GET_STORE1?\n');
        sendReply(XPN_X_STORE1);
      }
      break;
    case 0x16:
      if (length === 0x04) {
        console.log('LAN_GET_STORE2?\n');
        sendReply(XPN_X_STORE2);
      }
      break;
    case 0x84:
      /* ignore self sent data */
      break;
    default:
      console.log('XPN unknown');
      break;
  }
}
