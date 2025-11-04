#!/bin/bash

# Build and start production containers
echo "🚀 Starting production build..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

echo "✅ Production containers started!"
echo "🌐 Frontend: http://localhost:3000"
