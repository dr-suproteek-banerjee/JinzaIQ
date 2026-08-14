# Security

## Implemented

- Password hashing with Passlib bcrypt.
- JWT access tokens.
- Pydantic validation for request and AI-analysis schemas.
- CORS allowlist configuration.
- Security headers for content type, frames, and referrer policy.
- SQLAlchemy query construction instead of string-built SQL.
- No API keys committed; `.env.example` documents required variables.

## Threat Assumptions

This repository is a portfolio implementation, not a legal immigration product. Visa matching is a product signal only and must be verified by employers and official authorities.

## Production Hardening

- Replace local JWT secret.
- Use HTTPS-only cookies or hardened bearer-token storage.
- Add Redis-backed rate limiting for AI endpoints.
- Add audit logging for admin data imports.
- Enable CloudWatch alarms and error tracking.
