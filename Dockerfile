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

RUN apt-get update
RUN apt-get install -y gconf-service libasound2 libatk1.0-0 libcairo2 libcups2 libfontconfig1 libgdk-pixbuf2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libxss1 fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN dpkg -i google-chrome-stable_current_amd64.deb; apt-get -fy install

# RUN npm install --only=development
# RUN npm ci --only=production
# RUN yarn install --frozen-lockfile

CMD ["node", "dist/main"]