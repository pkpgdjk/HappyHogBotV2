FROM node:14-slim AS builder

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

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

# RUN npm install --only=development
# RUN npm ci --only=production
# RUN yarn install --frozen-lockfile

CMD ["node", "dist/main"]