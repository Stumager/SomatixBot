FROM node:20-slim AS frontend
WORKDIR /app/templates

COPY templates/package*.json ./
RUN npm ci

COPY templates/ ./
RUN npm run build

FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

COPY . /app/
COPY --from=frontend /app/templates/dist /app/templates/dist

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
