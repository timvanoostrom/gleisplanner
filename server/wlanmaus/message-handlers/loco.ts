import { printMessageToHex } from '../../helpers';
import { DCCSTEP14, DCCSTEP28, directions, speedSteps } from '../../config';

export function LAN_X_LOCO_INFO(message: Uint8Array) {
  // TODO: Understand what this means
  const adrMSB = message[6];
  const adrLSB = message[7];

  // console.log('get.loco.info', adrMSB, adrLSB);

  // 	// Fahrstufeninformation: 0=14, 2=28, 4=128
  // 	if ((ldata[0] & 0x03) == DCCSTEP14)
  // 		data[3] = 0;	// 14 steps
  // 	if ((ldata[0] & 0x03) == DCCSTEP28)
  // 		data[3] = 2;	// 28 steps
  // 	if ((ldata[0] & 0x03) == DCCSTEP128)
  // 		data[3] = 4;	// 128 steps
  // 	data[3] = data[3] | 0x08; //BUSY!
  const speedSteps = DCCSTEP14;

  // prettier-ignore
  const payload = [ 0x0e, 0x00, 0x40, 0x00, 0xef, adrMSB & 0x3f, adrLSB, speedSteps, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, ];

  return payload;
  // return [
  //   0x07 + 0x02,
  //   0x00,
  //   0x40,
  //   0x00,
  //   0xef,
  //   adrMSB & 0x3f,
  //   adrLSB,
  //   step,
  //   message[8],
  // ];
  //--------------------------------------------------------------------------------------------
  //Gibt aktuellen Lokstatus an Anfragenden Zur�ck

  // 	data[0] = LAN_X_LOCO_INFO;  //0xEF X-HEADER
  // 	data[1] = (Adr >> 8) & 0x3F;
  // 	data[2] = Adr & 0xFF;
  // 	// Fahrstufeninformation: 0=14, 2=28, 4=128
  // 	if ((ldata[0] & 0x03) == DCCSTEP14)
  // 		data[3] = 0;	// 14 steps
  // 	if ((ldata[0] & 0x03) == DCCSTEP28)
  // 		data[3] = 2;	// 28 steps
  // 	if ((ldata[0] & 0x03) == DCCSTEP128)
  // 		data[3] = 4;	// 128 steps
  // 	data[3] = data[3] | 0x08; //BUSY!

  // 	data[4] = (char) ldata[1];	//DSSS SSSS
  // 	data[5] = (char) ldata[2];  //F0, F4, F3, F2, F1
  // 	data[6] = (char) ldata[3];  //F5 - F12; Funktion F5 ist bit0 (LSB)
  // 	data[7] = (char) ldata[4];  //F13-F20
  // 	data[8] = (char) ldata[5];  //F21-F28
  // 	//Info to all:
  // 	for (byte i = 0; i < z21clientMAX; i++) {
  // 		if (ActIP[i].client != client) {
  // 			if ((ActIP[i].BCFlag & (Z21bcAll_s | Z21bcNetAll_s)) > 0) {
  // 				if (bc == true)
  // 					EthSend (ActIP[i].client, 14, LAN_X_Header, data, true, Z21bcNone);  //Send Loco status und Funktions to BC Apps
  // 			}
  // 		}
  // 		else { //Info to client that ask:
  // 			if (ActIP[i].adr == Adr) {
  // 				data[3] = data[3] & B111;	//clear busy flag!
  // 			}
  // 			EthSend (client, 14, LAN_X_Header, data, true, Z21bcNone);  //Send Loco status und Funktions to request App
  // 			data[3] = data[3] | 0x08; //BUSY!
  // 		}
  // 	}
  // }
  return [];
}

export function LAN_X_SET_LOCO_FUNCTION_reply(message: Uint8Array) {
  const funcId = message[8] & 0x1f;
  const switchtype = (message[8] >> 6) & 0x03;
  const locAddress = message[7] & 0x3f;
  // loco_id = be16(&udpframe[6]) & 0x3FFF;
  console.log(
    'LAN_X_SET_LOCO_FUNCTION_reply:::',
    locAddress,
    funcId,
    switchtype
  );
  let value: number = 0x00;
  if (switchtype == 2) {
    value = 0; // value = loco_get_function(m_id(loco_id), funcId) ^ 1;
  } else {
    value = switchtype;
  }
  // send_can_loco_function(loco_id, funcId, value, z21_data->foreground);
  return [];
}

export function LAN_X_SET_LOCO_DRIVE_reply(message: Uint8Array) {
  // const loco_id = be16(message[6]) & 0x3fff;
  console.log('LAN_X_SET_LOCO_DRIVE::', printMessageToHex(message));
  const adrMSB = message[6];
  const adrLSB = message[7];
  /* LAN_X_SET_LOCO_DRIVE */
  // v_printf(verbose, "LAN_X_SET_LOCO_DRIVE 0x%04X 0x%02X\n", loco_id, message[8]);
  const step = message[5] & 0x03;
  const direction = message[8] >> 7;
  const speed = message[8] & 0x7f; // Speed step is calculated according to speed tables

  const R = direction;
  const DB3 = `${R}VVVVVVV`;

  console.log(
    'adrMSB %s, adrLSB %s, step %s, dir %s, speed %s',
    adrMSB,
    adrLSB,
    speedSteps['' + step],
    directions['' + direction],
    speed,
    speed.toString(2),
    message[8].toString(2)
  );
  // TODO: Send loco commands to BiDiB bus
  return LAN_X_LOCO_INFO(message);
}
