importScripts('https://unpkg.com/mqtt/dist/mqtt.min.js');

let client = null;
let user_id = null;
let pingIntervalId = null;
self.onmessage = function(event) {
    const data = event.data;

    console.log('MQTT KEEPALIVE WORKER - received message ', data);
    if (data.action === 'start') {
        user_id = data.user_id;
        const endpoint = data.endpoint;
        const jwt = data.jwt;

        const options = {
            keepalive: 3,          // basso keepalive
            reconnectPeriod: 1000,
            clientId: data.client_id,
            username: 'JWT',
            password: jwt,
            rejectUnauthorized: false
        };

        client = mqtt.connect(endpoint, options);

        client.on('connect', () => {
            // start ping
            pingIntervalId = setInterval(() => {
                if (client && client.connected) {
                    console.log('MQTT KEEPALIVE WORKER - sending keepalive ping for user ', user_id);
                    client.publish(`apps/tilechat/users/${user_id}/keepalive`,
                        JSON.stringify({ ts: new Date().getTime() }));
                }
            }, 3000);
        });

        client.on('close', () => {
            clearInterval(pingIntervalId);
            pingIntervalId = null;
        });
    }else if (data.action === 'ping') {
        if (self.timer) return;
        self.timer = setInterval(() => {
            postMessage({ action: 'ping' });
        }, 3000);
    }

    if (data.action === 'stop') {
        if (pingIntervalId) clearInterval(pingIntervalId);
        if (client) client.end();
    }
};