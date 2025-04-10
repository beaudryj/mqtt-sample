FROM node:16-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install --production

# Copy application source
COPY . .

# Install curl for health checks
RUN apk add --no-cache curl

# Copy the startup script
COPY startup.sh /usr/local/bin/startup.sh

# Set environment variables (example values, replace with actual values or use secrets)
ENV MQTT_URL=mqtts://your-iot-endpoint.amazonaws.com:8883
ENV IOT_CERTIFICATE=your-certificate-pem
ENV IOT_PRIVATE_KEY=your-private-key
ENV AWS_IOT_CA_CERT=your-ca-cert

# Set environment variables (example values, replace with actual values or use secrets)
ENV MQTT_URL=mqtts://your-iot-endpoint.amazonaws.com:8883
ENV IOT_CERTIFICATE=your-certificate-pem
ENV IOT_PRIVATE_KEY=your-private-key
ENV AWS_IOT_CA_CERT=your-ca-cert

# Expose port
EXPOSE 8090

# Use the startup script as the entry point
ENTRYPOINT ["sh", "/usr/local/bin/startup.sh"]