# Use Node.js 20 LTS como base
FROM node:20-slim AS base

# Instala dependências necessárias para compilação nativa
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init && apt-get clean && rm -rf /var/lib/apt/lists/*

# Cria diretório da aplicação
WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./

# Stage para desenvolvimento
FROM base AS development
ENV NODE_ENV=development
RUN npm ci --include=dev
COPY . .
EXPOSE 5000
USER node
CMD ["dumb-init", "npm", "run", "dev"]

# Stage para build
FROM base AS build
ENV NODE_ENV=production
RUN npm ci --include=dev
COPY . .
RUN npm run build

# Stage para produção
FROM base AS production
ENV NODE_ENV=production
ENV PORT=5000

# Cria usuário não-root
RUN groupadd -g 1001 nodejs
RUN useradd -r -u 1001 -g nodejs nodejs

# Copia apenas arquivos necessários para produção
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copia código compilado
COPY --from=build --chown=nodejs:nodejs /app/dist ./dist
COPY --from=build --chown=nodejs:nodejs /app/public ./public

# Cria diretórios necessários
RUN mkdir -p logs && chown nodejs:nodejs logs

# Muda para usuário não-root
USER nodejs

# Expõe a porta
EXPOSE 5000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando para iniciar a aplicação
CMD ["dumb-init", "node", "dist/server.js"]