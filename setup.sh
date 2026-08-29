#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

print_step() {
  printf "\n\033[1;36m==>\033[0m %s\n" "$1"
}

print_warn() {
  printf "\033[1;33mWARN:\033[0m %s\n" "$1"
}

print_ok() {
  printf "\033[1;32mOK:\033[0m %s\n" "$1"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf "\033[1;31mERROR:\033[0m Missing required command: %s\n" "$1"
    exit 1
  fi
}

copy_env_if_missing() {
  local example_file="$1"
  local env_file="$2"

  if [[ ! -f "$example_file" ]]; then
    print_warn "Missing example env file: $example_file"
    return
  fi

  if [[ -f "$env_file" ]]; then
    print_ok "Keeping existing $env_file"
    return
  fi

  cp "$example_file" "$env_file"
  print_ok "Created $env_file from $example_file"
}

print_step "Checking required tools"
require_command node
require_command npm
require_command python3

if command -v docker >/dev/null 2>&1; then
  print_ok "Docker found"
else
  print_warn "Docker not found. Docker Compose services will not run until Docker is installed."
fi

if command -v flutter >/dev/null 2>&1; then
  print_ok "Flutter found"
else
  print_warn "Flutter not found. Mobile setup will be skipped."
fi

print_step "Node and npm versions"
node --version
npm --version

print_step "Preparing environment files"
copy_env_if_missing ".env.example" ".env"
copy_env_if_missing "apps/web-admin/.env.example" "apps/web-admin/.env"
copy_env_if_missing "services/api/.env.example" "services/api/.env"
copy_env_if_missing "services/ai/.env.example" "services/ai/.env"

print_step "Installing npm workspace dependencies"
npm install

if command -v docker >/dev/null 2>&1; then
  print_step "Starting local PostgreSQL and Redis"
  docker compose up -d postgres redis

  print_step "Applying database migrations"
  DATABASE_URL="${DATABASE_URL:-postgresql://closira:closira@localhost:5432/closira}" \
    npm --workspace services/api run prisma:migrate -- --name local_setup

  print_step "Seeding database"
  DATABASE_URL="${DATABASE_URL:-postgresql://closira:closira@localhost:5432/closira}" \
    npm --workspace services/api run prisma:seed
else
  print_warn "Skipping database migration and seed because Docker is not available."
fi

print_step "Installing Python AI service dependencies"
python3 -m pip install -r services/ai/requirements.txt

print_step "Training local baseline AI model"
PYTHONPATH=services/ai python3 services/ai/scripts/train_baseline.py \
  --dataset services/ai/data/sample_manifest.jsonl \
  --output services/ai/models/closira-baseline.json

print_step "Evaluating local baseline AI model"
PYTHONPATH=services/ai python3 services/ai/scripts/evaluate_baseline.py \
  --dataset services/ai/data/sample_manifest.jsonl \
  --model services/ai/models/closira-baseline.json

if command -v flutter >/dev/null 2>&1; then
  print_step "Installing Flutter mobile dependencies"
  (cd apps/mobile && flutter pub get)
fi

print_step "Running verification checks"
npm --workspace services/api run build
PYTHONPATH=services/ai CLOSIRA_MODEL_PATH=services/ai/models/closira-baseline.json python3 -m pytest services/ai/tests
npm --workspace apps/web-admin run lint
npm --workspace apps/web-admin exec tsc -- --noEmit
npm --workspace apps/web-admin run build

print_step "Setup complete"
cat <<'NEXT'

Useful next commands:

  # Start infrastructure if Docker is available
  docker compose up postgres redis

  # Start API
  npm --workspace services/api run start

  # Start AI service with trained baseline model
  CLOSIRA_MODEL_PATH=services/ai/models/closira-baseline.json \
  PYTHONPATH=services/ai python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000

  # Start web app
  npm --workspace apps/web-admin run dev

  # Or start API, AI, and web together
  ./run.sh

Local URLs:

  Web: http://localhost:3000
  API: http://localhost:3001/api/v1
  AI:  http://localhost:8000

NEXT
