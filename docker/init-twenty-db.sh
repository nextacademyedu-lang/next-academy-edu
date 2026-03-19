#!/bin/bash
set -e

# Create the 'twenty' database for Twenty CRM if it doesn't already exist.
# This script runs automatically on FIRST postgres startup (empty data volume).
# If the DB already has data, run manually:
#   docker exec -it nextacademy-db psql -U $DB_USER -c "CREATE DATABASE twenty;"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    SELECT 'CREATE DATABASE twenty'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'twenty')\gexec
EOSQL
