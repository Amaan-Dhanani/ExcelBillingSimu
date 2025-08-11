# Stage 1: Build frontend
FROM oven/bun:latest as frontend-builder

WORKDIR /app/frontend

COPY ./packages/frontend/package.json ./packages/frontend/bun.lockb* ./
COPY ./packages/frontend .

RUN bun install

# Stage 2: Setup backend and copy frontend build
FROM python:3.11-slim

WORKDIR /app/backend

COPY ./packages/backend/requirements.txt .
COPY ./packages/backend .

# Setup venv and install backend dependencies
RUN python -m venv venv \
 && . venv/bin/activate \
 && pip install --no-cache-dir -r requirements.txt

ENV PATH="/app/backend/venv/bin:$PATH"

# Copy frontend files from builder stage (if you want to serve frontend via backend)
COPY --from=frontend-builder /app/frontend /app/frontend

CMD ["python", "app.py"]
