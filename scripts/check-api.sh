#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Relay stack smoke test — verifies the full auth + dashboard flow end-to-end.
#
# Usage (from the repo root, inside your Codespace terminal):
#     bash scripts/check-api.sh
#     bash scripts/check-api.sh https://<your-codespace>-8000.app.github.dev
# ---------------------------------------------------------------------------
set -u

BASE_URL="${1:-http://localhost:8000}"
FRONT_URL="${2:-http://localhost:5173}"
DEMO_EMAIL="demo@emailsaas.com"
DEMO_PASSWORD="Demo@1234"

PASS=0
FAIL=0
TOKEN=""

ok()  { printf "  \033[32m✓ PASS\033[0m  %s\n" "$1"; PASS=$((PASS + 1)); }
bad() { printf "  \033[31m✗ FAIL\033[0m  %s\n" "$1"; [ -n "${2:-}" ] && printf "          → %s\n" "$2"; FAIL=$((FAIL + 1)); }

printf "\n\033[1mRelay stack check\033[0m — API: %s | Frontend: %s\n\n" "$BASE_URL" "$FRONT_URL"

# 1 ─ Backend is up ----------------------------------------------------------
STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$BASE_URL/api/health" 2>/dev/null || echo 000)
if [ "$STATUS" = "200" ]; then
  ok "Backend is up                (GET /api/health → 200)"
else
  bad "Backend unreachable          (GET /api/health → $STATUS)" \
      "Start it: cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000"
fi

# 2 ─ Wrong password is rejected ----------------------------------------------
STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@emailsaas.com","password":"wrong-password"}' 2>/dev/null || echo 000)
if [ "$STATUS" = "401" ]; then
  ok "Wrong password rejected      (POST /api/auth/login → 401)"
else
  bad "Wrong-password check         (expected 401, got $STATUS)"
fi

# 3 ─ Demo login returns a JWT -------------------------------------------------
RESPONSE=$(curl -s --max-time 5 -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$DEMO_EMAIL\",\"password\":\"$DEMO_PASSWORD\"}" 2>/dev/null)
TOKEN=$(printf '%s' "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null)
if [ -n "$TOKEN" ]; then
  ok "Demo login works             (POST /api/auth/login → 200 + JWT)"
  printf "          token: %s…\n" "${TOKEN:0:42}"
else
  bad "Demo login failed            (no access_token in response)" \
      "Response was: $RESPONSE"
fi

# 4 ─ Token verifies on /me ----------------------------------------------------
if [ -n "$TOKEN" ]; then
  BODY=$(curl -s --max-time 5 -w "\n%{http_code}" "$BASE_URL/api/auth/me" -H "Authorization: Bearer $TOKEN" 2>/dev/null)
  STATUS=$(printf '%s' "$BODY" | tail -n1)
  BODY=$(printf '%s' "$BODY" | head -n1)
  if [ "$STATUS" = "200" ]; then
    ok "JWT verified                 (GET /api/auth/me → 200)"
    printf "          user:  %s\n" "$BODY"
  else
    bad "JWT verification failed      (GET /api/auth/me → $STATUS)" "$BODY"
  fi
fi

# 5 ─ Protected dashboard stats -------------------------------------------------
if [ -n "$TOKEN" ]; then
  BODY=$(curl -s --max-time 5 -w "\n%{http_code}" "$BASE_URL/api/dashboard/stats" -H "Authorization: Bearer $TOKEN" 2>/dev/null)
  STATUS=$(printf '%s' "$BODY" | tail -n1)
  SUBS=$(printf '%s' "$BODY" | head -n1 | python3 -c "import sys,json; print(json.load(sys.stdin).get('total_subscribers',''))" 2>/dev/null)
  if [ "$STATUS" = "200" ] && [ "$SUBS" = "14502" ]; then
    ok "Protected stats work         (GET /api/dashboard/stats → 200, total_subscribers=14502)"
  else
    bad "Dashboard stats failed       (status=$STATUS, total_subscribers=$SUBS)"
  fi
fi

# 6 ─ Stats without a token are blocked ------------------------------------------
STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$BASE_URL/api/dashboard/stats" 2>/dev/null || echo 000)
if [ "$STATUS" = "401" ]; then
  ok "Unauthenticated access blocked (GET /api/dashboard/stats w/o token → 401)"
else
  bad "Auth guard check             (expected 401 without token, got $STATUS)"
fi

# 7 ─ Frontend dev server is up ---------------------------------------------------
STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$FRONT_URL" 2>/dev/null || echo 000)
if [ "$STATUS" = "200" ]; then
  ok "Frontend dev server is up    ($FRONT_URL → 200)"
else
  bad "Frontend unreachable         ($FRONT_URL → $STATUS)" \
      "Start it: cd frontend && npm run dev -- --host 0.0.0.0 --port 5173"
fi

# Summary -------------------------------------------------------------------------
printf "\n──────────────────────────────────────────────────────────\n"
if [ "$FAIL" -eq 0 ]; then
  printf "\033[1;32mAll %s checks passed — your stack is fully working.\033[0m\n" "$PASS"
  printf "Open the preview from the PORTS tab → port 5173 → globe icon, then\n"
  printf "log in with %s / %s\n\n" "$DEMO_EMAIL" "$DEMO_PASSWORD"
  exit 0
else
  printf "\033[1;31m%s passed, %s failed — see the fixes listed above.\033[0m\n\n" "$PASS" "$FAIL"
  exit 1
fi
