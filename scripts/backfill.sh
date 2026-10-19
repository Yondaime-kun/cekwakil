#!/bin/bash
# Backfill arsip Wayback — jalan tiap 6 jam dari mesin lokal.
export BASE="https://cekwakil.cekwakil0.workers.dev"
export ADMIN_TOKEN="$(cat /home/agentuser/.cekwakil_token | tr -d '\n')"
cd /home/agentuser/projects/cekwakil && node scripts/backfill-arsip.mjs 15 >> /tmp/backfill.log 2>&1
