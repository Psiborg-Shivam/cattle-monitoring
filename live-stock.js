const express = require("express");
const mqtt = require("mqtt");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const app = express();
const greenLed = 17;
const redLed = 5;
const blueLed = 6;
const loraTxLed = 27;
const configPin = 26;

changeLedState(greenLed, "l");
changeLedState(redLed, "l");
changeLedState(blueLed, "l");
changeLedState(loraTxLed, "l");
changeLedState(configPin, "h");



let port1 = 3000;


const { SerialPort } = require("serialport");
const port = new SerialPort({ path: "/dev/ttyAMA0", baudRate: 115200 });
const { ReadlineParser } = require("@serialport/parser-readline");
const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

const client = mqtt.connect("mqtt://localhost");

//const client2 = mqtt.connect("mqtt://103.127.30.171");
 const client2 = mqtt.connect("mqtt://103.127.30.171:1883");

// Connect to the broker
client.on("connect", () => {
  console.log("Publisher connect to MQTT broker");

  // Subscribe to the topic
  client.subscribe("livestockGateway", (err) => {
    if (!err) {
      console.log("Subscribed to the topic livestockGateway");
    } else {
      console.log("Subscribe Failed", err);
    }
  });
});

// Connect to the broker
client2.on("connect", () => {
  console.log("Publisher connect to Main Server/electrobolt  MQTT broker");

  // Subscribe to the topic
  client2.subscribe("livestockconfigcord", (err) => {
    if (!err) {
      console.log("Subscribed to the topic livestockGateway");
    } else {
      console.log("Subscribe Failed", err);
    }
  });
});
// client2.on("connect", () => {
//   console.log("Publisher connect to Main Server MQTT broker");

//   // Subscribe to the topic
//   client2.subscribe("livestokeGateway", (err) => {
//     if (!err) {
//       console.log("Subscribed to the topic");
//     } else {
//       console.log("Subscribe Failed", err);
//     }
//   });
// });

// Handle incomming message
client.on("message", (topic, message) => {
  console.log(`Received message on topic '${topic}': ${message.toString()}`);
});

// Handle incomming message
client2.on("message", (topic, message) => {
  console.log(`Received message on topic '${topic}': ${message.toString()}`);
  sendData(`${message.toString()}`);
});
// client2.on("message", (topic, message) => {
//   console.log(`Received message on topic '${topic}': ${message.toString()}`);
// });

function changeLedState(pinNumber, state){
 exec(`pinctrl set ${pinNumber} op d${state}`);
}

function blinkLed(ledType, time = 1){
  for(let i = 1; i <= 10 * time; i++){
      setTimeout(() => {
        changeLedState(ledType, i % 2 === 0 ? 'l' : 'h');
      }, i * 100);
  }
}


/*
async function connectSerialPort() {
  try {
    parser.on("data", async (data) => {
      blinkLed(loraTxLed);
      console.log("Data from port Device=====>", typeof data, data);

      const deviceType = data.trim().slice(-2);
      console.log("Device type log:", deviceType);
      let json = {};
      if (Number(deviceType) === 1) {
        json = {
          id: data.slice(0, 8),
          latitude: data.slice(8, 16).replace(/^(\d{2})/, "$1."),
          longitude: data.slice(16, 24).replace(/^(\d{2})/, "$1."),
          heartRate: data.slice(24, 27),
          battery: data.slice(27, 30),
          temperature: data.slice(30, 35).replace(/^(\d{3})/, "$1."),
          activity: data.slice(35, 39),
          rumination: data.slice(39, 43),
          dateAndTime: new Date(data.slice(53, 57), Number(data.slice(51, 53)) - 1, data.slice(49, 51), data.slice(43, 45), data.slice(45, 47), data.slice(47, 49)),
          deviceType: "collar",
        };
        console.log(json);

      client.publish("livestockServer", JSON.stringify(json));
      }
      else if (Number(deviceType) === 2) {
        json = {
          id: data.slice(0, 8),
          battery: data.slice(8, 11),
          steps: data.slice(11, 16),
          deviceType: "pedometer",
        };
        console.log(json);

      client.publish("livestockServer", JSON.stringify(json));
      }
      
     // client2.publish("livestokeServer", JSON.stringify(json));
      // client2.publish("agroGateway", data);

      setTimeout(() => {
        blinkLed(blueLed);
      }, 500)
    });
  } catch (error) {
    console.log(error, "error from my side app");
  }
}

*/


/*
async function connectSerialPort() {
  try {
    parser.on('data', async (data) => {
      blinkLed(loraTxLed);
      console.log('Data from port Device=====>', typeof data, data);
      const deviceType = data.trim().slice(-2);
      console.log('Device type log:', deviceType);
      let json = {};
      if (Number(deviceType) === 1) {
        const lastDigit = Number(data.trim().slice(-4, -2));
	console.log(lastDigit,"lasttttttttttttttttttttt");        
if (lastDigit === 1) {
	
          json = {
            id: data.slice(0, 8),
            latitude: data.slice(8, 16).replace(/^(\d{2})/, '$1.'),
            longitude: data.slice(16, 24).replace(/^(\d{2})/, '$1.'),
            heartRate: data.slice(24, 27),
            battery: data.slice(27, 30),
            temperature: data.slice(30, 35).replace(/^(\d{3})/, '$1.'),
            activity: data.slice(35, 39),
            rumination: data.slice(39, 43),
            dateAndTime: new Date(
              data.slice(53, 57),
              Number(data.slice(51, 53)) - 1,
              data.slice(49, 51),
              data.slice(43, 45),
              data.slice(45, 47),
              data.slice(47, 49)
            ),
            deviceType: 'collar',
          };
        } else {
          if (data.slice(-6, -4) === '06') {
            json = {
              id: data.slice(0, 8),
              alertType: 'geofence',
              latitude: data.slice(8, 16).replace(/^(\d{2})/, '$1.'),
              longitude: data.slice(16, 24).replace(/^(\d{2})/, '$1.'),
              deviceType: 'collar',
            };
          } else if (data.slice(-6, -4) === '07') {
            json = {
              id: data.slice(0, 8),
              alertType: 'battery',
              batteryPercent: data.slice(8, 11),
              deviceType: 'collar',
            };
          }
        }
        console.log(json);
        client.publish('livestockServer', JSON.stringify(json));
      } else if (Number(deviceType) === 2) {
        json = {
          id: data.slice(0, 8),
          battery: data.slice(8, 11),
          steps: data.slice(11, 16),
          deviceType: 'pedometer',
        };
        console.log(json);
        client.publish('livestockServer', JSON.stringify(json));
      }
       client2.publish("livestokeServer", JSON.stringify(json));
      // client2.publish("agroGateway", data);
      setTimeout(() => {
        blinkLed(blueLed);
      }, 500);
    });
  } catch (error) {
    console.log(error, 'error from my side app');
  }
}
*/


async function connectSerialPort() {
  try {
    parser.on('data', async (data) => {
      blinkLed(loraTxLed);
      console.log('Data from port Device=====>', typeof data, data);
      const deviceType = data.trim().slice(-2);
      console.log('Device type log:', deviceType);
      let json = {};
      if (Number(deviceType) === 1) {
        const lastDigit = Number(data.trim().slice(-4, -2));
        if (lastDigit === 1) {
          json = {
            id: data.slice(0, 8),
            latitude: data.slice(8, 16).replace(/^(\d{2})/, '$1.'),
            longitude: data.slice(16, 24).replace(/^(\d{2})/, '$1.'),
            heartRate: data.slice(24, 27),
            battery: data.slice(27, 30),
            temperature: data.slice(30, 35).replace(/^(\d{3})/, '$1.'),
            activity: data.slice(35, 39),
            rumination: data.slice(39, 43),
            dateAndTime: new Date(
              data.slice(53, 57),
              Number(data.slice(51, 53)) - 1,
              data.slice(49, 51),
              data.slice(43, 45),
              data.slice(45, 47),
              data.slice(47, 49)
            ),
            deviceType: 'collar',
          };
        } else {
          if (data.trim().slice(-6, -4) === '06') {
            json = {
              id: data.slice(0, 8),
              alertType: 'geofence',
              latitude: data.slice(8, 16).replace(/^(\d{2})/, '$1.'),
              longitude: data.slice(16, 24).replace(/^(\d{2})/, '$1.'),
              dateAndTime: new Date(
                data.slice(34, 38),
                Number(data.slice(32, 34)) - 1,
                data.slice(30, 32),
                data.slice(24, 26),
                data.slice(26, 28),
                data.slice(28, 30)
              ),
              deviceType: 'collar',
            };
          } else if (data.trim().slice(-6, -4) === '07') {
            json = {
              id: data.slice(0, 8),
              alertType: 'battery',
              battery: data.slice(8, 11),
              dateAndTime: new Date(
                data.slice(21, 25),
                Number(data.slice(19, 21)) - 1,
                data.slice(17, 19),
                data.slice(11, 13),
                data.slice(13, 15),
                data.slice(15, 17)
              ),
              deviceType: 'collar',
            };
          }
        }
        console.log(json);
        client.publish('livestockServer', JSON.stringify(json));
        client2.publish('livestockServer', JSON.stringify(json));
      } else if (Number(deviceType) === 2) {
        json = {
          id: data.slice(0, 8),
          battery: data.slice(8, 11),
          steps: data.slice(11, 16),
          deviceType: 'pedometer',
        };
        console.log(json);
        client.publish('livestockServer', JSON.stringify(json));
        client2.publish('livestockServer', JSON.stringify(json));
      }
      // client2.publish("livestokeServer", JSON.stringify(json));
      // client2.publish("agroGateway", data);
      setTimeout(() => {
        blinkLed(blueLed);
      }, 500);
    });
  } catch (error) {
    console.log(error, 'error from my side app');
  }
}



// this one is commented for i am not using uart
connectSerialPort();

function checkInternetConnectivity() {
  setInterval(() => {
    exec('ping -c 1 8.8.8.8', (error, stdout, stderr) => {
      if (error) {
        blinkLed(redLed, 10);
        console.error(`Error checking internet connectivity: ${error.message}`);
        return;
      }

      if (stderr) {
        console.error(`Ping command encountered an error: ${stderr}`);
        return;
      }
    //  console.log(stdout.includes('1 packets transmitted, 1 received') ? 'Internet is connected' : 'Internet is disconnected');

      stdout.includes('1 packets transmitted, 1 received') ? blinkLed(greenLed, 8) : blinkLed(redLed, 10);
    });
  }, 10000); // Check every 10 seconds
}

// Start checking internet connectivity
checkInternetConnectivity();



/*
// Function to send data
function sendData() {
changeLedState(configPin, "l");
  const data = '{\"geofenceLat\":34.20121031918911, \"geofenceLon\":74.82950890254612}\r\n'; // Replace with your data

  port.write(data, (err) => {
    if (err) {
      return console.error('Error writing to UART:', err.message);
    }
    console.log('Data sent:', data);
  });
changeLedState(configPin, "h");
}
*/

// Function to send data
function sendData(message) {
  changeLedState(configPin, "l");
  // const data1 = '{"geofenceLat":34.20121031918911, "geofenceLon":74.82950890254612}\r\n';
  const data = message;
  console.log(data);
  setTimeout(() => {
    port.write(data, (err) => {
      if (err) {
        return console.error('Error writing to UART:', err.message);
      }
      console.log('Data sent:', data);
    });

    changeLedState(configPin, "h");
  }, 500);

}



// Send data every 5 seconds
// setInterval(sendData, 10000);
// setTimeout(sendData, 20000);



app.use(
  express.static(path.join(__dirname, "../frontend/build"), {
    cacheControl: false,
  })
);
app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

app.listen(port1, () => {
  console.log(`Server is running on ${port1}`);
//  require("./openBrowser")();
});
