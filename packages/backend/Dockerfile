FROM python:3.11-slim
WORKDIR /backend
COPY ./packages/backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY ./packages/backend .
CMD ["python", "app.py"]
