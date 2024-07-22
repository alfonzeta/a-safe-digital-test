YOUR_DOCKERHUB_USER=alfonsoz

.PHONY: all backend_dig  clean

all:  backend_dig

backend_dig:
	@echo "Building backend..."
	docker build -t $(YOUR_DOCKERHUB_USER)/backend_dig:latest backend_dig/

dev: all
	docker compose up

deploy: all
	docker push $(YOUR_DOCKERHUB_USER)/backend_dig:latest

	@echo "Deploying to server..."
	@ssh debian@51.254.97.250 -p 55912 "/home/debian/digital/update_and_restart.sh"


	