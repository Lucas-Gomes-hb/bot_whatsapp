FROM ghcr.io/puppeteer/puppeteer:latest
USER root
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    libgbm1 \
    libnss3 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libasound2 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 3000

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

CMD ["node", "index.js"]