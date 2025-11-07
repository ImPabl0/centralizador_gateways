# Use a imagem oficial do Node.js
FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Definir variável de ambiente da API
ENV NEXT_PUBLIC_API_URL=https://soupablo.dev/gateways

# Build da aplicação Next.js
RUN npm run build

# Expor a porta 5001
EXPOSE 5001

# Comando para iniciar a aplicação
CMD ["npm", "start", "--", "-p", "5001"]