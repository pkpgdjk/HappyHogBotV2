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
RUN apt-get install -y gnupg2
RUN apt-get install -y wget --no-install-recommends \
  && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/* \
  && apt-get purge --auto-remove -y curl \
  && rm -rf /src/*.deb

# RUN npm install --only=development
# RUN npm ci --only=production
# RUN yarn install --frozen-lockfile

EXPOSE 4000

CMD ["node", "dist/main"]