FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
ENV CI=true
COPY . /workspace
WORKDIR /workspace
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpx nx build server
RUN pnpm deploy --filter=server --prod /deploy
RUN mv /deploy/node_modules dist/products/server/node_modules

FROM base AS server
COPY --from=build /workspace/dist/products/server /app
WORKDIR /app
EXPOSE 80
CMD [ "node", "." ]

