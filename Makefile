# Makefile para Centralizador de Gateways PIX

# Variáveis
DOCKER_COMPOSE = docker-compose
DOCKER_COMPOSE_DEV = docker-compose -f docker-compose.dev.yml
PROJECT_NAME = centralizador-gateways

# Comandos de ajuda
.PHONY: help
help: ## Mostra esta mensagem de ajuda
	@echo "Comandos disponíveis:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Comandos de desenvolvimento
.PHONY: dev
dev: ## Inicia o ambiente de desenvolvimento
	cp .env.docker .env
	$(DOCKER_COMPOSE_DEV) up --build

.PHONY: dev-bg
dev-bg: ## Inicia o ambiente de desenvolvimento em background
	cp .env.docker .env
	$(DOCKER_COMPOSE_DEV) up --build -d

.PHONY: dev-logs
dev-logs: ## Mostra os logs do ambiente de desenvolvimento
	$(DOCKER_COMPOSE_DEV) logs -f

.PHONY: dev-stop
dev-stop: ## Para o ambiente de desenvolvimento
	$(DOCKER_COMPOSE_DEV) down

.PHONY: dev-clean
dev-clean: ## Para e remove containers, redes e volumes de desenvolvimento
	$(DOCKER_COMPOSE_DEV) down -v --remove-orphans

# Comandos de produção
.PHONY: prod
prod: ## Inicia o ambiente de produção
	cp .env.docker .env
	$(DOCKER_COMPOSE) up --build -d

.PHONY: prod-logs
prod-logs: ## Mostra os logs do ambiente de produção
	$(DOCKER_COMPOSE) logs -f

.PHONY: prod-stop
prod-stop: ## Para o ambiente de produção
	$(DOCKER_COMPOSE) down

.PHONY: prod-clean
prod-clean: ## Para e remove containers, redes e volumes de produção
	$(DOCKER_COMPOSE) down -v --remove-orphans

# Comandos com perfis
.PHONY: dev-ngrok
dev-ngrok: ## Inicia desenvolvimento com ngrok para webhooks
	cp .env.docker .env
	$(DOCKER_COMPOSE_DEV) --profile with-ngrok up --build -d

# Comandos de build
.PHONY: build
build: ## Builda a imagem Docker
	docker build -t $(PROJECT_NAME):latest .

.PHONY: build-dev
build-dev: ## Builda a imagem Docker para desenvolvimento
	docker build --target development -t $(PROJECT_NAME):dev .

.PHONY: build-prod
build-prod: ## Builda a imagem Docker para produção
	docker build --target production -t $(PROJECT_NAME):prod .

# Comandos de limpeza
.PHONY: clean
clean: ## Remove todas as imagens e containers do projeto
	docker-compose down -v --remove-orphans
	docker-compose -f docker-compose.dev.yml down -v --remove-orphans
	docker rmi $(PROJECT_NAME):latest $(PROJECT_NAME):dev $(PROJECT_NAME):prod 2>/dev/null || true
	docker system prune -f

.PHONY: clean-all
clean-all: ## Remove tudo relacionado ao Docker (CUIDADO!)
	docker system prune -a -f --volumes

# Comandos de teste
.PHONY: test
test: ## Executa os testes no container
	$(DOCKER_COMPOSE_DEV) exec app-dev npm test

.PHONY: test-build
test-build: ## Testa se a build funciona corretamente
	docker build --target build -t $(PROJECT_NAME):test .
	docker rmi $(PROJECT_NAME):test

# Comandos utilitários
.PHONY: shell
shell: ## Abre shell no container de desenvolvimento
	$(DOCKER_COMPOSE_DEV) exec app-dev sh

.PHONY: shell-prod
shell-prod: ## Abre shell no container de produção
	$(DOCKER_COMPOSE) exec app sh

.PHONY: logs
logs: ## Mostra logs (use com make logs-dev ou make logs-prod)
	@echo "Use 'make dev-logs' ou 'make prod-logs'"

.PHONY: ps
ps: ## Mostra status dos containers
	$(DOCKER_COMPOSE) ps
	$(DOCKER_COMPOSE_DEV) ps

.PHONY: restart
restart: ## Reinicia o serviço principal
	$(DOCKER_COMPOSE) restart app

.PHONY: restart-dev
restart-dev: ## Reinicia o serviço de desenvolvimento
	$(DOCKER_COMPOSE_DEV) restart app-dev

# Comandos de monitoramento
.PHONY: health
health: ## Verifica saúde da aplicação
	curl -f http://localhost:5000/health || echo "Serviço não está respondendo"

# Default
.DEFAULT_GOAL := help