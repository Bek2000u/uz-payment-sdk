# Changelog

All notable changes to this project should be documented in this file.

The format is inspired by Keep a Changelog and follows SemVer expectations, while the package API is still stabilizing in `0.x`.

## [Unreleased]

## [0.2.0] - 2026-04-22

### Added

- provider-scoped low-level clients: `PaymeClient`, `ClickClient`, `UzumClient`
- exported stable SDK contract constants: `SDK_RESULT_CONTRACT`, `SDK_SUPPORT_POLICY`
- server-ready helpers for Next.js and other fetch-based runtimes
- webhook request helpers for parsing and processing provider callbacks from `Request`
- fixture-based provider contract tests and a fuller test matrix
- short docs set in `docs/sdk`
- injectable transport layer with `createAxiosTransport`, `createFetchTransport`, request `signal`, `timeoutMs`, and retry options
- typed SDK errors: `PaymentSdkError`, `PaymentValidationError`, `PaymentConfigurationError`, `PaymentTransportError`
- workflow-safer payment flags: `isTerminal`, `isSettled`, `isFinalSuccess`, `requiresAction`

### Changed

- public API now uses `Client` names instead of legacy `Driver` names
- release workflow now checks contract tests and Bun compatibility
- webhook idempotency now requires shared cache storage by default for production safety
- sensitive log masking is now recursive and safer for nested payloads

## [0.1.0] - 2026-04-22

### Added

- initial open-source release for `payme`, `click`, and `uzum`
- `PaymentsService` facade and provider-specific low-level operations
- webhook normalization for `click` and `payme`
- Uzum merchant toolkit helpers
