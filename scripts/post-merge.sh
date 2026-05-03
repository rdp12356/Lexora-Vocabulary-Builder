#!/bin/bash
set -e
npm ci --prefer-offline --no-audit || npm install
npm --workspace=@workspace/db run push
