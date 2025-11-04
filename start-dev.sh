#!/bin/bash

# Build and start development containers
echo "🔨 Starting development environment..."
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up

echo "✅ Development server started!"
echo "🌐 Frontend: http://localhost:3000"
