# Use a small Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json (skip yarn.lock if missing)
COPY package.json ./

# If yarn.lock exists, copy it too
COPY yarn.lock ./ || true

# Install dependencies
RUN yarn install --frozen-lockfile || yarn install

# Copy application source
COPY . .

# Expose ports (if needed for debugging)
EXPOSE 1883 8883

# Start the application
CMD ["yarn", "start"]