#!/bin/bash
# Single-process startup for Render free tier
# Runs uvicorn + celery worker + celery beat together

set -e

echo "Starting Celery worker..."
celery -A app.worker worker --loglevel=info --detach \
  --logfile=/tmp/celery-worker.log \
  --pidfile=/tmp/celery-worker.pid

echo "Starting Celery beat..."
celery -A app.worker beat --loglevel=info --detach \
  --logfile=/tmp/celery-beat.log \
  --pidfile=/tmp/celery-beat.pid \
  --schedule=/tmp/celery-beat-schedule

echo "Starting Uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT
