FROM node:14-slim AS builder

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./


# Adds required libs
RUN apt-get -y update
RUN apt-get -y install autoconf automake g++ libtool 
RUN yarn global add rimraf

# RUN npm install
# RUN npm ci --only=development
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn run build

FROM node:14-slim as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

COPY . .

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules

RUN apt-get -y update
RUN apt-get update && \
    apt-get install -yq gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 \
    libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 \
    libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
    libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 \
    ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget

# RUN npm install --only=development
# RUN npm ci --only=production
# RUN yarn install --frozen-lockfile

CMD ["node", "dist/main"]