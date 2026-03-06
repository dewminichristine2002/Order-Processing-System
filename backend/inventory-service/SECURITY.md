# Inventory Service — Security Notes

This document summarizes the main security considerations for the Inventory Service.

## Secrets & configuration

- No secrets should be hard-coded or committed to git.
- Database connection details are supplied through environment variables (see HELP.md).
- If any credential was exposed during development, rotate it immediately (Supabase: reset DB password / rotate pooler password).

## Transport security

- For Supabase Postgres, JDBC is configured with TLS required (`sslmode=require`).
- In production, the API should be served behind HTTPS (typically provided by the cloud load balancer / ingress).

## Database access

- Prefer least-privilege credentials (separate user for the service if possible).
- Recommended production setting: `INVENTORY_JPA_DDL_AUTO=validate` and manage schema changes with migrations (Flyway/Liquibase).

## Input validation & error handling

- API requests use DTOs and validation annotations where applicable.
- Avoid returning stack traces or internal exception details to clients in production logs/responses.

## Inter-service calls (Order Service notification)

- The Order Service notification is best-effort and should not expose secrets in logs.
- Treat the Order Service URL as configuration (env var), not code.
- If deploying across networks, restrict egress where possible and use service-to-service auth (e.g., mTLS, signed tokens) when required by your environment.

## Operational hardening

- Run the container with a minimal runtime image (JRE) and avoid bundling build tools.
- Monitor health via Actuator (`/actuator/health`).
- Keep dependencies updated and review vulnerability alerts (GitHub Dependabot / security scanning).
