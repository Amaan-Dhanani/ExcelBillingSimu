FROM oven/bun:latest
WORKDIR /frontend
COPY ./packages/frontend/package.json ./packages/frontend/bun.lockb* ./
RUN bun install
COPY ./packages/frontend .
CMD ["bun", "run", "dev"]
