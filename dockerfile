# Use a small Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json (no yarn.lock needed)
COPY package.json ./

# Install dependencies using npm
RUN npm install --omit=dev

# Copy application source
COPY . .

# Expose ports (if needed for debugging)
EXPOSE 1883 8883

# Start the application
CMD ["npm", "start"]
