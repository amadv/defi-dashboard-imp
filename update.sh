#!/bin/bash

# Script Vars
REPO_URL="https://github.com/amadv/defi-dashboard-imp.git"
APP_DIR=~/myapp

# Pull the latest changes from the Git repository
if [ -d "$APP_DIR" ]; then
  echo "Pulling latest changes from the repository..."
  cd $APP_DIR
  git pull origin main
else
  echo "Cloning repository from $REPO_URL..."
  git clone $REPO_URL $APP_DIR
  cd $APP_DIR
fi

# Install dependencies including new ones like shadcn-ui, clsx, and tailwind-merge
echo "Installing dependencies..."
npm install

# Make sure bash is available for Docker
echo "Checking if Docker configuration needs bash..."
if ! grep -q "apk add --no-cache bash" Dockerfile; then
  echo "Adding bash to Dockerfile..."
  sed -i '/FROM node:18-alpine/a\# Install bash for shell scripts\nRUN apk add --no-cache bash' Dockerfile
fi

# Generate database data and prepare scripts
echo "Setting up database..."
npm run sql:setup

# Build and restart the Docker containers from the app directory (~/myapp)
echo "Rebuilding and restarting Docker containers..."
sudo docker-compose down
sudo docker-compose up --build -d

# Check if Docker Compose started correctly
if ! sudo docker-compose ps | grep "Up"; then
  echo "Docker containers failed to start. Check logs with 'docker-compose logs'."
  exit 1
fi

# Output final message
echo "Update complete. Your Next.js app has been deployed with the latest changes."

