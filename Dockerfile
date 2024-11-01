# Use an official Node.js runtime as a parent image
FROM node:18-alpine AS deps

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json for dependencies installation
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the Next.js application
RUN npm run build

# Run Prisma migrations
RUN npx prisma migrate deploy

# Expose the port the app runs on
EXPOSE 9000

# Command to run the application
CMD ["npm", "start"]
