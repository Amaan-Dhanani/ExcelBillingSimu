FROM oven/bun:latest

WORKDIR /frontend

COPY . ./

RUN bun install --force --verbose
RUN bun run build --debug

# Expose Frontend Port
EXPOSE 3000
ENV PORT=3000

CMD ["bun", "./build/index.js"]