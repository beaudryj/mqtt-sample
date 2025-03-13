const awsIot = require("aws-iot-device-sdk");
const fs = require("fs");
const path = require("path");

// Create a temporary directory for the certificate files
const CERTS_DIR = "/tmp/certs";
if (!fs.existsSync(CERTS_DIR)) {
    fs.mkdirSync(CERTS_DIR, { recursive: true });
}

// Write environment variables to temporary files
const keyPath = path.join(CERTS_DIR, "private.key");
const certPath = path.join(CERTS_DIR, "certificate.pem");
const caPath = path.join(CERTS_DIR, "AmazonRootCA1.pem");

fs.writeFileSync(keyPath, process.env.IOT_PRIVATE_KEY);
fs.writeFileSync(certPath, process.env.IOT_CERTIFICATE);
fs.writeFileSync(caPath, process.env.AWS_IOT_CA_CERT);

// Create the device object with the temporary file paths
const device = awsIot.device({
    keyPath: keyPath,
    certPath: certPath,
    caPath: caPath,
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