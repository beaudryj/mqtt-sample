# Use a small Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy application source
COPY . .

# Expose ports (if needed for debugging)
EXPOSE 1883 8883

# Start the application
CMD ["yarn", "start"]
