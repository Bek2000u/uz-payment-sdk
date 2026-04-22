# Contributing

Thanks for contributing to `uz-payment-sdk`.

## Local Setup

```bash
npm install
npm run typecheck
npm test
npm run build
```

## Before Opening a PR

- keep public SDK API framework-agnostic
- keep supported providers limited to `payme`, `click`, `uzum`
- update `README.md` when changing public API or money contract
- add or update tests for provider-specific behaviour
- run `npm run release:smoke`

## Scope

Good contributions:

- provider contract fixes against official docs
- typing improvements
- DX improvements for `PaymentsService`
- webhook tooling improvements
- docs and examples cleanup

Out of scope unless discussed first:

- reintroducing removed providers
- adding framework-specific app/server layers into core
- mixing demo apps into the publishable package
