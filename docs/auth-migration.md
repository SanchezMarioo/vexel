# Auth Migration Guide

This project uses an internal auth contract so you can replace the provider later with low risk.

## Current Setup

- Provider adapter: `lib/auth/options.ts` (NextAuth credentials + Google)
- App contract: `lib/auth/contracts.ts`
- App service entrypoint: `lib/auth/service.ts`
- Data adapters: `lib/data/users.ts`, `lib/data/projects.ts`

## What Is Stable (Do Not Break)

- `SessionUser` shape in `lib/auth/contracts.ts`
- `authService` methods in `lib/auth/service.ts`
- Private pages consume only `requireSessionUser()` and data repositories

## How To Migrate Provider

1. Keep `lib/auth/contracts.ts` as-is.
2. Replace adapter logic in `lib/auth/options.ts`.
3. Preserve `session.user.id` in the new provider callbacks.
4. Keep register endpoint response contract in `app/api/auth/register/route.ts`.
5. Keep protected route behavior in `proxy.ts`:
   - Unauthenticated user to `/auth/login?callbackUrl=...`
   - Authenticated user out of `/auth/login` and `/auth/register`
6. Run full verification:
   - Register (email/password)
   - Login (credentials)
   - Social login
   - Logout
   - Access to `/cuenta/*`

## Optional Future Refactor

If you switch to a provider with first-class user storage (for example Clerk or Auth0),
you can keep `lib/data/projects.ts` and replace only the user adapter mapping in `lib/data/users.ts`.
