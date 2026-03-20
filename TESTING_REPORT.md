# End-to-End Testing Report
**Date:** 2026-03-20
**Project:** MyVSL (Flowline)
**Branch:** testing/2026-03-20

## Executive Summary
- **Total API Endpoints Tested:** 25
- **Bugs Found:** 3
- **Bugs Fixed:** 3
- **Overall Product Status:** Ship-Ready

## API Endpoint Test Results

### Public Endpoints (No Auth Required)
| Endpoint | Method | Test | Expected | Got | Status |
|----------|--------|------|----------|-----|--------|
| /api/events | POST | valid shape, invalid UUIDs | 200 | 200 | PASS |
| /api/events | POST | empty body | drop with reason | drop with reason | PASS |
| /api/events/batch | POST | valid batch | 200 | 200 | PASS |
| /api/sessions/:id | POST | invalid UUID | 400 | 400 | PASS |
| /api/sessions/:id | POST | nonexistent funnel | 404 | 500 -> FIXED -> 404 | FIXED |
| /api/submit/:id | POST | invalid UUID | 400 | 400 | PASS |
| /api/submit/:id | POST | nonexistent funnel | 404 | 404 | PASS |
| /api/submit/:id | POST | missing email | 400 | 400 | PASS |
| /api/submit/:id | POST | invalid email | 400 | 400 | PASS |
| /api/og | GET | renders OG image | 200 | 200 | PASS |
| /api/slugs/check | GET | check slug | 200 + available | 200 + available | PASS |
| /api/sequences/unsubscribe | GET | no token | 400 | 400 | PASS |
| /api/ai/plan | POST | empty prompt | 400 | 400 | PASS |
| /api/ai/plan | POST | valid prompt | 200 + questions | 200 + questions | PASS |
| /api/ai/plan | POST | 2100 char prompt | 400 rejected | 400 rejected | PASS |

### Protected Endpoints (Should 401 Without Auth)
| Endpoint | Method | Expected | Got | Status |
|----------|--------|----------|-----|--------|
| /api/funnels | GET | 401 | 401 | PASS |
| /api/user | GET | 401 | 401 | PASS |
| /api/leads | GET | 401 | 401 | PASS |
| /api/admin/stats | GET | 401 | 401 | PASS |
| /api/admin/domains | GET | 401 | 403 -> FIXED -> 401 | FIXED |
| /api/billing/portal | GET | 405 (no GET handler) | 405 | PASS (by design) |
| /api/teams | GET | 401 | 401 | PASS |
| /api/funnels | POST | 401 | 401 | PASS |
| /api/billing/checkout | POST | 401 | 401 | PASS |
| /api/teams | POST | 401 | 401 | PASS |

### Webhook Endpoints
| Endpoint | Test | Expected | Got | Status |
|----------|------|----------|-----|--------|
| /api/webhooks/clerk | POST no headers | 400 | 400 | PASS |
| /api/stripe/webhook | POST no sig | 400 | 400 | PASS |

### Cron Endpoint
| Test | Expected | Got | Status |
|------|----------|-----|--------|
| No auth | 401 | 401 | PASS |
| Fake x-vercel-cron header | 401 | 200 -> FIXED -> 401 | FIXED |

### Static Pages
| Page | Expected | Got | Status |
|------|----------|-----|--------|
| / | 200 | 200 | PASS |
| /pricing | 200 | 200 | PASS |
| /terms | 200 | 200 | PASS |
| /privacy | 200 | 200 | PASS |
| /build | 200 | 200 | PASS |
| /sign-in | 200 | 200 | PASS |
| /sign-up | 200 | 200 | PASS |
| /nonexistent | 404 | 404 | PASS |

## Bugs Found & Fixed

| # | Severity | Location | Description | Fix |
|---|----------|----------|-------------|-----|
| 1 | High | /api/sessions/[funnelId] | Returns 500 on nonexistent funnel (FK constraint) | Wrap insertSession in try/catch, return 404 |
| 2 | High | /api/cron/sequences | Accepts spoofed x-vercel-cron header | Remove header check, require CRON_SECRET bearer token only |
| 3 | Low | /api/admin/domains | Returns 403 instead of 401 for unauthenticated requests | Separate auth check (401) from admin check (403) |
