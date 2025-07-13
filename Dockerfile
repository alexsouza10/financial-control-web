# Usa uma imagem Node.js para construir o aplicativo
FROM node:20-alpine AS build

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos package.json e package-lock.json (ou yarn.lock)
COPY package*.json ./

# Instala as dependências do Node.js
RUN npm install

# Copia o restante dos arquivos da aplicação
COPY . .

# Constrói a aplicação Nuxt (modo de produção)
# Dependendo do seu nuxt.config.ts, você pode precisar de 'nuxt build' ou 'npm run build'
RUN npm run build

# Usa uma imagem Nginx para servir os arquivos estáticos
FROM nginx:alpine AS production

# Remove a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia a configuração personalizada do Nginx (você precisará criar este arquivo)
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos gerados da build do Nuxt para o diretório de serviço do Nginx
COPY --from=build /app/.vercel/output/static /usr/share/nginx/html

# Expõe a porta 80 (padrão para HTTP)
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]