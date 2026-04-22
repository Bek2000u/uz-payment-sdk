# Testing Matrix

SDK использует 4 слоя проверок:

- `npm run typecheck`
  статическая проверка публичных и внутренних типов
- `npm run test:contracts`
  fixture-based contract tests по official provider payloads
- `npm test`
  основной Jest suite
- `npm run test:bun`
  совместимость с Bun runtime

Полный локальный прогон:

```bash
npm run test:matrix
```

Release smoke:

```bash
npm run release:smoke
```

Он дополнительно проверяет:

- clean build
- `require('./dist/index.js')`
- минимальный consumer import через `scripts/smoke-consumer.cjs`
