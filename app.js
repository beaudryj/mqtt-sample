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

// Log the file paths and contents for debugging
console.log("Key Path:", keyPath);
console.log("Cert Path:", certPath);
console.log("CA Path:", caPath);
console.log("Key Content:", fs.readFileSync(keyPath, 'utf-8'));
console.log("Cert Content:", fs.readFileSync(certPath, 'utf-8'));
console.log("CA Content:", fs.readFileSync(caPath, 'utf-8'));

// Create the device object with the temporary file paths
const device = awsIot.device({
    keyPath: keyPath,
    certPath: certPath,
    caPath: caPath,
    clientId: "ecs-backup-client",
    host: process.env.MQTT_URL.replace("mqtts://", "").split(":")[0],
    protocol: "mqtts",
    reconnectPeriod: 10000,  // 🔄 Increase to 10 seconds
    keepalive: 60,           // 🔄 Extend keepalive to prevent frequent drops
    debug: true
});

// Handle connection
device.on("connect", function () {
    console.log("✅ Fully connected to AWS IoT MQTT!");
    
    setTimeout(() => {  // 🔄 Add a delay before subscribing
        device.subscribe("test/topic", (err, granted) => {
            if (err) {
                console.error("❌ Subscription error:", err);
            } else {
                console.log("📥 Subscribed to topic:", granted);
            }
        });
    }, 2000);  // 2-second delay to prevent AWS disconnects
});

// Handle incoming messages
device.on("message", function (topic, payload) {
    console.log(`📥 Received message on ${topic}:`, payload.toString());
});

// Handle errors
device.on("error", function (error) {
    console.error("❌ MQTT Error:", error);
    console.error(error.stack);
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