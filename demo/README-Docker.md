# Demo Docker

Este diretório contém a aplicação demo Next.js configurada para rodar em Docker.

## Configuração

- **Porta**: 5001
- **API URL**: https://soupablo.dev/gateways

## Como usar

### Build da imagem Docker:
```bash
docker build -t demo-checkout .
```

### Executar o container:
```bash
docker run -p 5001:5001 demo-checkout
```

### Executar com variável de ambiente personalizada:
```bash
docker run -p 5001:5001 -e NEXT_PUBLIC_API_URL=http://localhost:5000 demo-checkout
```

A aplicação estará disponível em: http://localhost:5001