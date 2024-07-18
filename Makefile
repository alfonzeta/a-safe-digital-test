.DEFAULT_GOAL := dev

DOCKER_COMPOSE = docker compose
DOCKER = docker

build:
	@echo "Building the app..."
	@$(DOCKER_COMPOSE) build

dev: 
	@echo "Starting app in development mode..."
	@$(DOCKER_COMPOSE) down
	@$(DOCKER_COMPOSE) up --build

down:
	@echo "Stopping Docker containers..."
	@$(DOCKER_COMPOSE) down

install:
	@echo "Installing dependencies..."
	@$(NPM) install

clean:
	@echo "Cleaning up..."
	@$(DOCKER_COMPOSE) down --rmi all

bash:
	@echo "Starting bash..."
	@$(DOCKER_COMPOSE) exec backend bash

sync:
	@$(DOCKER_COMPOSE) exec backend npm run build

.PHONY: build dev down install clean bash
