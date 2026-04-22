# Releasing

## Versioning Policy

- `0.x`:
  допускаются breaking changes, если они помогают стабилизировать API
- `1.0+`:
  breaking changes только через major release

## Release Checklist

1. Обновить `CHANGELOG.md`
2. Убедиться, что public API и README синхронизированы
3. Запустить:

```bash
npm run test:matrix
npm run release:smoke
```

4. Поднять версию в `package.json`
5. Создать tag вида `v0.2.0`
6. Запушить tag
7. Проверить GitHub Actions publish workflow

## Automation

Workflow `publish.yml`:

- запускается на `v*` tag или вручную
- прогоняет полную тестовую матрицу
- публикует пакет в npm
- создаёт GitHub Release
