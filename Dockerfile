# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM node:20-alpine as base
WORKDIR /usr/src/app

RUN apk add --no-cache openssl ncurses-libs libstdc++
RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*
ENV NODE_ENV=development


# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS dev-install

RUN mkdir -p /temp/dev
COPY package.json package-lock.json .npmrc /temp/dev/
RUN ls -la /temp/dev
RUN cd /temp/dev && npm ci
RUN rm /temp/dev/.npmrc

# run tests
FROM dev-install as test
RUN cd /temp/dev 
RUN npm run test

FROM base AS release-install
# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json package-lock.json .npmrc /temp/prod/
RUN cd /temp/prod && npm ci --omit=dev
RUN rm /temp/prod/.npmrc

# copy  node_modules from temp directory
# then copy  all (non-ignored) project files into the image
FROM base AS build
COPY --from=dev-install /temp/dev/node_modules node_modules
COPY src src
COPY package.json package-lock.json tsconfig.json ./

# build
RUN ls -la
RUN npm run build
# RUN tsc -p tsconfig.json
USER node
ENV NODE_ENV=production

# # copy production dependencies and source code into final image
FROM base AS release
COPY --from=release-install /temp/prod/node_modules node_modules
COPY --from=build /usr/src/app/lib ./lib
COPY --from=build /usr/src/app/package.json .

# run the app
EXPOSE 8008/tcp
CMD [ "node", "lib/index.js" ]