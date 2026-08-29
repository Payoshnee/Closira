#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

MODE="${1:-all}"
AI_MODEL_PATH="${CLOSIRA_MODEL_PATH:-services/ai/models/closira-baseline.json}"

print_step() {
  printf "\n\033[1;36m==>\033[0m %s\n" "$1"
}

print_warn() {
  printf "\033[1;33mWARN:\033[0m %s\n" "$1"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf "\033[1;31mERROR:\033[0m Missing required command: %s\n" "$1"
    exit 1
  fi
}

port_pids() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    lsof -ti "tcp:$port" 2>/dev/null || true
  fi
}

require_port_free() {
  local port="$1"
  local label="$2"
  local pids
  pids="$(port_pids "$port" | tr '\n' ' ')"

  if [[ -n "$pids" ]]; then
    printf "\033[1;31mERROR:\033[0m Port %s is already in use for %s. PID(s): %s\n" "$port" "$label" "$pids"
    printf "Run \033[1m./run.sh stop\033[0m to stop Closira dev ports, then run \033[1m./run.sh %s\033[0m again.\n" "$MODE"
    exit 1
  fi
}

stop_dev_ports() {
  local ports=(3000 3001 8000)
  local found=0

  for port in "${ports[@]}"; do
    local pids
    pids="$(port_pids "$port")"
    if [[ -n "$pids" ]]; then
      found=1
      print_step "Stopping process(es) on port $port"
      while IFS= read -r pid; do
        [[ -n "$pid" ]] && kill "$pid" 2>/dev/null || true
      done <<< "$pids"
    fi
  done

  if [[ "$found" -eq 0 ]]; then
    print_step "No Closira dev ports are currently in use"
  fi
}

start_process() {
  local name="$1"
  shift

  print_step "Starting $name"
  "$@" &
  PIDS+=("$!")
}

stop_all() {
  if [[ ${#PIDS[@]} -gt 0 ]]; then
    print_step "Stopping services"
    for pid in "${PIDS[@]}"; do
      kill "$pid" 2>/dev/null || true
    done
  fi
}

show_help() {
  cat <<'HELP'
Usage:
  ./run.sh [all|web|api|ai|infra|stop]

Modes:
  all     Start API, AI service, and web app
  web     Start only Next.js web app
  api     Start only NestJS API
  ai      Start only FastAPI AI service
  infra   Start Docker Compose infrastructure: postgres and redis
  stop    Stop processes using Closira dev ports: 3000, 3001, 8000

Environment:
  CLOSIRA_MODEL_PATH  AI model artifact path.
                      Defaults to services/ai/models/closira-baseline.json

URLs:
  Web: http://localhost:3000
  API: http://localhost:3001/api/v1
  AI:  http://localhost:8000
HELP
}

PIDS=()
trap stop_all EXIT INT TERM

case "$MODE" in
  help|--help|-h)
    show_help
    exit 0
    ;;
  stop)
    stop_dev_ports
    exit 0
    ;;
  infra)
    require_command docker
    print_step "Starting Docker Compose infrastructure"
    docker compose up postgres redis
    ;;
  web)
    require_command npm
    require_port_free 3000 "web app"
    npm --workspace apps/web-admin run dev
    ;;
  api)
    require_command npm
    require_port_free 3001 "API"
    npm --workspace services/api run start
    ;;
  ai)
    require_command python3
    require_port_free 8000 "AI service"
    if [[ ! -f "$AI_MODEL_PATH" ]]; then
      print_warn "AI model not found at $AI_MODEL_PATH. Run ./setup.sh first or set CLOSIRA_MODEL_PATH."
    fi
    CLOSIRA_MODEL_PATH="$AI_MODEL_PATH" PYTHONPATH=services/ai python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000
    ;;
  all)
    require_command npm
    require_command python3
    require_port_free 3000 "web app"
    require_port_free 3001 "API"
    require_port_free 8000 "AI service"
    if [[ ! -f "$AI_MODEL_PATH" ]]; then
      print_warn "AI model not found at $AI_MODEL_PATH. Run ./setup.sh first or set CLOSIRA_MODEL_PATH."
    fi
    start_process "API" npm --workspace services/api run start
    start_process "AI service" env CLOSIRA_MODEL_PATH="$AI_MODEL_PATH" PYTHONPATH=services/ai python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000
    start_process "web app" npm --workspace apps/web-admin run dev
    print_step "Services started"
    cat <<'URLS'

Web: http://localhost:3000
API: http://localhost:3001/api/v1
AI:  http://localhost:8000

Press Ctrl+C to stop all services.
URLS
    wait
    ;;
  *)
    printf "\033[1;31mERROR:\033[0m Unknown mode: %s\n\n" "$MODE"
    show_help
    exit 1
    ;;
esac
