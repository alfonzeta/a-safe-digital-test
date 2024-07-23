# Stage 1: Build
FROM node:20 AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application (if using TypeScript)
RUN npm run build

# Stage 2: Runtime
FROM node:20-slim

# Install OpenSSL
RUN apt-get update -y && apt-get install -y openssl

# Create a group and user
RUN groupadd -r testgroup && useradd -r -g testgroup testuser

# Set the working directory
WORKDIR /app

# Copy the build output from the previous stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma

# Copy the entrypoint script
COPY entrypoint.sh /app/entrypoint.sh

# Install production dependencies
RUN npm install --only=production

# Change ownership of the entire working directory to testuser
RUN chown -R testuser:testgroup /app

# Switch to testuser
USER testuser

# Expose the port the app runs on
EXPOSE 8080

CMD ["npm", "start"]