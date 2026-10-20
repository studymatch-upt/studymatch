# StudyMatch mobile

Aplicação Expo para Android e iOS, com entrada demonstrativa e estrutura inicial da área do Aluno.

## Arrancar

Requer Node.js 22.13 ou superior.

```sh
cd mobile
npm ci
npm start
```

Para a Development Build instalada no iPhone, usar `npx expo start --dev-client` e abrir a sessão na aplicação. A configuração EAS local deve ser preservada; não é necessário gerar uma nova build para estas alterações de interface.

## Experiência demonstrativa do Aluno

No login, introduzir um email com formato válido, uma palavra-passe não vazia e selecionar Aluno. O acesso abre os separadores Início, Projetos, Grupos e Perfil. Professor e Admin continuam no ecrã demonstrativo anterior. O registo continua a ser uma simulação e não inicia sessão nem cria uma conta.

- Início: identidade ilustrativa, cartão Overall com radar de seis eixos, indicadores de atividade sem números até existir uma fonte legítima, e calendário semanal expansível para o mês completo. É possível selecionar um dia e navegar entre meses; a legenda de entregas não representa eventos existentes.
- Projetos: disponíveis e inscrições, detalhes informativos e estados vazios.
- Grupos: ativos e concluídos, detalhes informativos e estados vazios.
- Perfil: dados fictícios, tema claro/escuro/sistema e saída para o login.

Os exemplos estão centralizados em `src/features/student/data.ts`. A sessão demonstrativa vive apenas em memória; reiniciar a aplicação exige voltar a entrar. Não é autenticação. O tema usa a persistência local já existente.

O cartão Overall não apresenta pontuação global: o backend ainda não fornece esse valor. O mini radar mantém os seis eixos e só desenha uma linha de dados quando as seis pontuações conhecidas forem fornecidas. Nesta fase, o login demonstrativo não estabelece uma associação segura a um `studentId`; os indicadores de atividade ficam sem números e não são pedidos dados académicos ao backend.

O radar, questionário, inscrições, membros reais, matching, autenticação e integração com API ficam para Issues próprios.

## Verificações

```sh
npm run typecheck
npm run lint
npm run doctor
node --test src/features/student/calendarDates.test.mjs
npx expo export --platform ios --platform android --output-dir .expo/student-bundles
```

As rotas do aluno ficam em `src/app/student/`, os elementos partilhados desta funcionalidade em `src/features/student/` e o Design System em `src/components/` e `src/theme/`.

### Revisão manual no iPhone

1. Confirmar os três perfis no login; Aluno abre Início, Professor/Admin mantêm a confirmação demonstrativa.
2. Alternar pelos quatro separadores; abrir e voltar de competências, projeto e grupo.
3. Alternar Disponíveis/Inscrições e Ativos/Concluídos; verificar os estados vazios.
4. No Perfil, experimentar claro/escuro/sistema e confirmar legibilidade, rolagem e safe areas.
5. Terminar a sessão: regressar ao login e confirmar que voltar não reabre a área do aluno.
6. No registo, confirmar que Número de aluno só aparece para Aluno, que é obrigatório e rejeita letras; Professor/Admin não o exigem.

TypeScript, lint e exportação de bundles não substituem esta revisão visual num dispositivo. O projeto não inclui `react-native-web`; não foi gerado um preview web.
