var BluetoothHciSocket = require('../index');

var bluetoothHciSocket = new BluetoothHciSocket();

bluetoothHciSocket.on('data', function(data) {
  console.log('data:  ' + data.toString('hex'));

  if (data.readUInt8(0) === HCI_EVENT_PKT) {
    if (data.readUInt8(1) === EVT_CMD_COMPLETE) {
      if (data.readUInt16LE(4) == LE_SET_ADVERTISING_PARAMETERS_CMD) {
        if (data.readUInt8(6) === HCI_SUCCESS) {
          console.log('LE Advertising Parameters Set');
        }
      } else if (data.readUInt16LE(4) === LE_SET_ADVERTISING_DATA_CMD) {
        if (data.readUInt8(6) === HCI_SUCCESS) {
          console.log('LE Advertising Data Set');
        }
      } else if (data.readUInt16LE(4) === LE_SET_SCAN_RESPONSE_DATA_CMD) {
        if (data.readUInt8(6) === HCI_SUCCESS) {
          console.log('LE Scan Response Data Set');
        }
      } else if (data.readUInt16LE(4) === LE_SET_ADVERTISE_ENABLE_CMD) {
        if (data.readUInt8(6) === HCI_SUCCESS) {
          console.log('LE Advertise Enable Set');
        }
      }
    }
  }
});

bluetoothHciSocket.on('error', function(error) {
  // TODO: non-BLE adaptor

  if (error.message === 'Operation not permitted') {
    console.log('state = unauthorized');
  } else if (error.message === 'Network is down') {
    console.log('state = powered off');
  } else {
    console.error(error);
  }
});

var HCI_COMMAND_PKT = 0x01;
var HCI_ACLDATA_PKT = 0x02;
var HCI_EVENT_PKT = 0x04;

var EVT_CMD_COMPLETE = 0x0e;
var EVT_CMD_STATUS = 0x0f;

var OGF_LE_CTL = 0x08;
var OCF_LE_SET_ADVERTISING_PARAMETERS = 0x0006;
var OCF_LE_SET_ADVERTISING_DATA = 0x0008;
var OCF_LE_SET_SCAN_RESPONSE_DATA = 0x0009;
var OCF_LE_SET_ADVERTISE_ENABLE = 0x000a;

var LE_SET_ADVERTISING_PARAMETERS_CMD = OCF_LE_SET_ADVERTISING_PARAMETERS | OGF_LE_CTL << 10;
var LE_SET_ADVERTISING_DATA_CMD = OCF_LE_SET_ADVERTISING_DATA | OGF_LE_CTL << 10;
var LE_SET_SCAN_RESPONSE_DATA_CMD = OCF_LE_SET_SCAN_RESPONSE_DATA | OGF_LE_CTL << 10;
var LE_SET_ADVERTISE_ENABLE_CMD = OCF_LE_SET_ADVERTISE_ENABLE | OGF_LE_CTL << 10;

var HCI_SUCCESS = 0;

function setFilter() {
  var filter = new Buffer(14);
  var typeMask = (1 << HCI_EVENT_PKT) | (1 << HCI_ACLDATA_PKT);
  var eventMask1 = (1 << EVT_CMD_COMPLETE) | (1 << EVT_CMD_STATUS);
  var eventMask2 = 0;
  var opcode = 0;

  filter.writeUInt32LE(typeMask, 0);
  filter.writeUInt32LE(eventMask1, 4);
  filter.writeUInt32LE(eventMask2, 8);
  filter.writeUInt16LE(opcode, 12);

  bluetoothHciSocket.setFilter(filter);
}

function setAdvertisingParameter() {
  var cmd = new Buffer(19);

  // header
  cmd.writeUInt8(HCI_COMMAND_PKT, 0);
  cmd.writeUInt16LE(LE_SET_ADVERTISING_PARAMETERS_CMD, 1);

  // length
  cmd.writeUInt8(15, 3);

  // data
  cmd.writeUInt16LE(0x00a0, 4); // min interval
  cmd.writeUInt16LE(0x00a0, 6); // max interval
  cmd.writeUInt8(0x00, 8); // adv type
  cmd.writeUInt8(0x00, 9); // own addr typ
  cmd.writeUInt8(0x00, 10); // direct addr type
  (new Buffer('000000000000', 'hex')).copy(cmd, 11); // direct addr
  cmd.writeUInt8(0x07, 17);
  cmd.writeUInt8(0x00, 18);

  console.log('write: ' + cmd.toString('hex'))
  bluetoothHciSocket.write(cmd);
};

function setAdvertisingData(data) {
  var cmd = new Buffer(5 + data.length);

  // header
  cmd.writeUInt8(HCI_COMMAND_PKT, 0);
  cmd.writeUInt16LE(LE_SET_ADVERTISING_DATA_CMD, 1);

  // length
  cmd.writeUInt8(1 + data.length, 3);

  // data
  cmd.writeUInt8(data.length, 4);
  data.copy(cmd, 5);

  console.log('write: ' + cmd.toString('hex'))
  bluetoothHciSocket.write(cmd);
}

function setScanResponseData(data) {
  var cmd = new Buffer(5 + data.length);

  // header
  cmd.writeUInt8(HCI_COMMAND_PKT, 0);
  cmd.writeUInt16LE(LE_SET_SCAN_RESPONSE_DATA_CMD, 1);

  // length
  cmd.writeUInt8(1 + data.length, 3);

  // data
  cmd.writeUInt8(data.length, 4);
  data.copy(cmd, 5);

  console.log('write: ' + cmd.toString('hex'))
  bluetoothHciSocket.write(cmd);
}

function setAdvertiseEnable(enabled) {
  var cmd = new Buffer(5);

  // header
  cmd.writeUInt8(HCI_COMMAND_PKT, 0);
  cmd.writeUInt16LE(LE_SET_ADVERTISE_ENABLE_CMD, 1);

  // length
  cmd.writeUInt8(0x01, 3);

  // data
  cmd.writeUInt8(enabled ? 0x01 : 0x00, 4); // enable: 0 -> disabled, 1 -> enabled

  console.log('write: ' + cmd.toString('hex'));
  bluetoothHciSocket.write(cmd);
}

bluetoothHciSocket.start();
setFilter();
bluetoothHciSocket.bind();

console.log('address = ' + bluetoothHciSocket.getAddress());
console.log('address type = ' + bluetoothHciSocket.getAddressType());
console.log('isDevUp = ' + bluetoothHciSocket.isDevUp());

setAdvertiseEnable(false);
setAdvertisingParameter();
setAdvertisingData(new Buffer('0201061aff4c000215b9407f30f5f8466eaff925556b57fe6d00010002b6', 'hex'));
setScanResponseData(new Buffer('0909657374696d6f74650e160a182eb8855fb5ddb601000200', 'hex'));
setAdvertiseEnable(true);
