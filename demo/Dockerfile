# Use a imagem oficial do Node.js
FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./



# Instalar pnpm
RUN npm install -g pnpm

# Instalar dependências
RUN npm install --frozen-lockfile

# Copiar código fonte
COPY . .

# Build da aplicação React + Vite
RUN npm run build

# Instalar servidor estático para servir os arquivos buildados
RUN npm install -g serve

# Expor a porta 5001
EXPOSE 5001

# Comando para servir a aplicação buildada
CMD ["serve", "-s", "dist", "-l", "5001"]