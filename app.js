const awsIot = require("aws-iot-device-sdk");
const fs = require("fs");
const path = require("path");

// Create a temporary directory inside the container
const CERTS_DIR = "/tmp/certs";
if (!fs.existsSync(CERTS_DIR)) {
    fs.mkdirSync(CERTS_DIR, { recursive: true });
}

// Write environment variables as certificate files
fs.writeFileSync(path.join(CERTS_DIR, "certificate.pem"), process.env.IOT_CERTIFICATE);
fs.writeFileSync(path.join(CERTS_DIR, "private.key"), process.env.IOT_PRIVATE_KEY);
fs.writeFileSync(path.join(CERTS_DIR, "AmazonRootCA1.pem"), process.env.AWS_IOT_CA_CERT);

const device = awsIot.device({
    keyPath: path.join(CERTS_DIR, "private.key"),
    certPath: path.join(CERTS_DIR, "certificate.pem"),
    caPath: path.join(CERTS_DIR, "AmazonRootCA1.pem"),
    clientId: `ecs-backup-client-${Math.floor(Math.random() * 1000)}`,
    host: process.env.MQTT_URL.replace("mqtts://", "").split(":")[0],
    protocol: "mqtts"
});

// Handle connection
device.on("connect", function () {
    console.log("✅ Connected to AWS IoT MQTT!");
    
    // Subscribe to a test topic
    device.subscribe("test/topic");

    // Publish every 5 seconds
    setInterval(() => {
        device.publish("test/topic", JSON.stringify({ message: "Hello from Backup MQTT Client!" }));
        console.log("📢 Published: Hello from Backup MQTT Client!");
    }, 5000);
});

// Handle incoming messages
device.on("message", function (topic, payload) {
    console.log(`📥 Received message on ${topic}:`, payload.toString());
});

// Handle errors
device.on("error", function (error) {
    console.error("❌ MQTT Error:", error);
});
