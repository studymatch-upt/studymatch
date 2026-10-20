# StudyMatch mobile

Aplicação Expo para Android e iOS. Nesta fase, o ecrã inicial serve apenas para confirmar que a base funciona.

## Arrancar

Requer Node.js 22.13 ou superior.

```sh
cd mobile
npm ci
npm start
```

Abrir no Expo Go ou num emulador Android. O simulador iOS requer macOS.

## Verificações

```sh
npm run typecheck
npm run lint
npm run doctor
```

As rotas ficam em `src/app/`. Os restantes diretórios em `src/` estão preparados para as próximas funcionalidades.
