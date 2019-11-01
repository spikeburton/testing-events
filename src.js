const net = require('net');

function ping(hostname, port, timeout = 1000) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();

    client.on('connect', () => {
      client.destroy();
      resolve(true);
    });
    client.on('error', () => {
      client.destroy();
      reject({ error: 'COULD NOT CONNECT' });
    });
    client.on('timeout', () => {
      client.destroy();
      resolve(false);
    });

    client.setTimeout(timeout);
    client.connect(port, hostname);
  });
}

module.exports = ping;
