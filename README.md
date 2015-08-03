# node-bluetooth-hci-socket

Bluetooth HCI socket binding for Node.js

__NOTE:__ Currently only supports __Linux__.

## Install

```sh
npm install bluetooth-hci-socket
```

## Usage

```javascript
var BluetoothHciSocket = require('bluetooth-hci-socket');
```

### Actions

#### Create

```javascript
var bluetoothHciSocket = new BluetoothHciSocket();
```

#### Set Filter

```javascript
var filter = new Buffer(14);

// ...

bluetoothHciSocket.setFilter(filter);
```

#### Bind

##### Raw Channel

```javascript
bluetoothHciSocket.bindRaw([deviceId]); // optional deviceId (integer)
```

##### Control Channel

```javascript
bluetoothHciSocket.bindControl();
```

#### Is Device Up

Query the device state. __Note:__ must be called after ```bindRaw```.

```
var isDevUp = bluetoothHciSocket.isDevUp(); // returns: true or false
```

#### Start/stop

Start or stop event handling:

```javascript
bluetoothHciSocket.start();

// ...

bluetoothHciSocket.stop();
```

#### Write

```javascript
var data = new Buffer(/* ... */);

// ...


bluetoothHciSocket.write(data);
```

### Events

#### Data

```javascript
bluetoothHciSocket.on('data', function(data) {
  // data is a Buffer

  // ...
});
```

#### Error

```javascript
bluetoothHciSocket.on('error', function(error) {
  // error is a Error

  // ...
});
```

## Examples

See [examples folder](https://github.com/sandeepmistry/node-bluetooth-hci-socket/blob/master/examples) for code examples.
