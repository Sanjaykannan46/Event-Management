echo "Pulling latest code from GitHub..."
git pull origin main

echo "Building Docker Compose..."
docker-compose build

echo "Running DaddyEMS..."
docker-compose up -d