FROM python:3.13-slim

WORKDIR /app/

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libexpat1 \
    diamond-aligner \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


COPY . .

WORKDIR /app/Server
EXPOSE 5123

CMD ["gunicorn", "--timeout", "300","-b", "0.0.0.0:5123", "main:app"]