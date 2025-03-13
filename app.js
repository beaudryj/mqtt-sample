const awsIot = require("aws-iot-device-sdk");

// Create the device object with environment variables
const device = awsIot.device({
    keyPath: Buffer.from(process.env.IOT_PRIVATE_KEY, 'base64').toString('utf-8'),
    certPath: Buffer.from(process.env.IOT_CERTIFICATE, 'base64').toString('utf-8'),
    caPath: Buffer.from(process.env.AWS_IOT_CA_CERT, 'base64').toString('utf-8'),
    clientId: `ecs-backup-client-${Math.floor(Math.random() * 1000)}`,
    host: process.env.MQTT_URL.replace("mqtts://", "").split(":")[0],
    protocol: "mqtts"
});

// Handle connection
device.on("connect", function () {
    console.log("✅ Connected to AWS IoT MQTT!");
    
    // Subscribe to a test topic
    device.subscribe("test/topic", (err, granted) => {
        if (err) {
            console.error("❌ Subscription error:", err);
        } else {
            console.log("📥 Subscribed to topic:", granted);
        }
    });

    // Publish every hour
    setInterval(() => {
        const message = { message: "Hello from Backup MQTT Client!" };
        device.publish("test/topic", JSON.stringify(message), (err) => {
            if (err) {
                console.error("❌ Publish error:", err);
            } else {
                console.log("📢 Published:", message);
            }
        });
    }, 3600000); // 1 hour in milliseconds
});

// Handle incoming messages
device.on("message", function (topic, payload) {
    console.log(`📥 Received message on ${topic}:`, payload.toString());
});

// Handle errors
device.on("error", function (error) {
    console.error("❌ MQTT Error:", error);
});

// Handle reconnection
device.on("reconnect", function () {
    console.log("🔄 Reconnecting to AWS IoT MQTT...");
});

// Handle offline
device.on("offline", function () {
    console.log("⚠️ MQTT Client is offline.");
});

// Handle close
device.on("close", function () {
    console.log("❌ MQTT Client connection closed.");
});