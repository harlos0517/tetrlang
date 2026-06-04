FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --config.minimumReleaseAge=0
RUN pnpm build

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile --config.minimumReleaseAge=0

FROM prod-deps
COPY --from=build /app/packages/core/dist /app/packages/core/dist
COPY --from=build /app/packages/renderer/dist /app/packages/renderer/dist
CMD [ "pnpm", "bot" ]
