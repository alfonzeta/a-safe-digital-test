# Load environment variables from .env
ifneq (,$(wildcard .env))
include .env
export
endif

.PHONY: all backend_dig clean dev deploy

all: backend_dig

backend_dig:
	@echo "Building backend..."
	docker build -t $(YOUR_DOCKERHUB_USER)/backend_dig:latest .
# Development commands
dev: backend_dig
	@echo "Building..."
	npm run build

	@echo "Running development commands..."
	# Start Docker Compose
	docker compose up
	

# Deploy command
deploy: all
	@echo "Pushing Docker image to Docker Hub..."
	docker push $(YOUR_DOCKERHUB_USER)/backend_dig:latest

	@echo "Deploying to server..."
	@ssh ${REMOTE_CONNECTION}

# Clean up
clean:
	@echo "Cleaning up Docker containers and images..."
	-docker compose down -v
	-docker rmi $(YOUR_DOCKERHUB_USER)/backend_dig:latest
