#!/usr/bin/env bash
set -e

echo "Starting Grafana..."

/run.sh &
PID=$!

echo "Waiting for Grafana database..."

until [ -f /var/lib/grafana/grafana.db ]; do
  sleep 1
done

echo "Database detected, applying configuration..."

if [ -n "${GRAFANA_PASSWORD}" ]; then
  grafana-cli admin reset-admin-password "${GRAFANA_PASSWORD}"
fi

echo "Init complete"

wait $PID
