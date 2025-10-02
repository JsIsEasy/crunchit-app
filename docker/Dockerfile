FROM node:22

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY package.json .

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

COPY . .

RUN pnpm run build

EXPOSE 8000

CMD [ "pnpm","start"]