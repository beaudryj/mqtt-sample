const awsIot = require("aws-iot-device-sdk");
const fs = require("fs");
const path = require("path");

// Create certs directory if not exists
const CERTS_DIR = "/app/certs";
if (!fs.existsSync(CERTS_DIR)) {
    fs.mkdirSync(CERTS_DIR, { recursive: true });
}

// Write certificates from Terraform environment variables
fs.writeFileSync(path.join(CERTS_DIR, "certificate.pem"), process.env.IOT_CERTIFICATE);
fs.writeFileSync(path.join(CERTS_DIR, "private.key"), process.env.IOT_PRIVATE_KEY);
fs.writeFileSync(path.join(CERTS_DIR, "AmazonRootCA1.pem"), process.env.AWS_IOT_CA_CERT);

const device = awsIot.device({
    keyPath: path.join(CERTS_DIR, "private.key"),
    certPath: path.join(CERTS_DIR, "certificate.pem"),
    caPath: path.join(CERTS_DIR, "AmazonRootCA1.pem"),
    clientId: `ecs-client-${Math.floor(Math.random() * 1000)}`,
    host: process.env.MQTT_URL.replace("mqtts://", "").split(":")[0], // Extract host from URL
    protocol: "mqtts"
});

// Handle connection
device.on("connect", function () {
    console.log("✅ Connected to AWS IoT MQTT!");

    // Subscribe to a test topic
    device.subscribe("test/topic");

    // Publish every 5 seconds
    setInterval(() => {
        device.publish("test/topic", JSON.stringify({ message: "Hello from ECS!" }));
        console.log("📢 Published: Hello from ECS!");
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
