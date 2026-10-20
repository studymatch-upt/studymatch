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

### Alunos de teste ligados ao backend (apenas desenvolvimento)

No portátil, configurar `EXPO_PUBLIC_STUDYMATCH_API_URL` antes de iniciar o Expo. Usar o endereço HTTP do backend acessível pelo iPhone na mesma rede, com a porta do serviço, por exemplo `http://<ENDERECO_DO_PORTATIL>:8080`. Não usar `localhost` no iPhone. Pode guardar a variável em `mobile/.env.local` (ignorado pelo Git) ou defini-la na sessão do terminal. Reiniciar o Expo depois de mudar o valor.

O login mostra “Contas de teste” apenas em desenvolvimento, com botões para entrar diretamente como Carla Mendes ou Diogo Ferreira sem palavra-passe. Ao tocar num deles, consulta `GET /api/students` e procura `carla@school.test` ou `diogo@school.test`; depois lê estudante, questionário, inscrições e perfil pelas APIs existentes. Os IDs vêm sempre da API. A sessão é demonstrativa e não autentica uma conta. O botão “Atualizar dados” volta a ler as quatro fontes. Não há escrita no backend nem edição de notas nesta etapa.

Sem backend acessível ou sem a conta escolhida na base de dados, a área mostra um erro e oferece nova tentativa, mantendo os dois botões visíveis. As respostas do questionário local continuam guardadas separadamente e nunca substituem o perfil oficial desses alunos.

## Experiência demonstrativa do Aluno

No login, introduzir um email com formato válido, uma palavra-passe não vazia e selecionar Aluno. O acesso abre os separadores Início, Projetos, Grupos e Perfil. Professor e Admin continuam no ecrã demonstrativo anterior. O registo continua a ser uma simulação e não inicia sessão nem cria uma conta.

- Início: identidade ilustrativa na sessão local ou dados do aluno selecionado na sessão de desenvolvimento, cartão Overall com radar de seis eixos, indicadores de atividade sem números até existir uma fonte legítima, e calendário semanal expansível para o mês completo. É possível selecionar um dia e navegar entre meses; a legenda de entregas não representa eventos existentes.
- Projetos: disponíveis e inscrições, detalhes informativos e estados vazios.
- Grupos: ativos e concluídos, detalhes informativos e estados vazios.
- Perfil: dados fictícios na sessão local ou dados lidos do backend para Carla/Diogo, tema claro/escuro/sistema e saída para o login.

Os exemplos estão centralizados em `src/features/student/data.ts`. A sessão demonstrativa vive apenas em memória; reiniciar a aplicação exige voltar a entrar. Não é autenticação. O tema usa a persistência local já existente.

O cartão Overall não apresenta pontuação global: o backend ainda não fornece esse valor. O mini radar e o radar grande usam o mesmo perfil. A sessão local não estabelece associação a um `studentId`; a seleção Carla/Diogo em desenvolvimento associa apenas o ID devolvido pela API, sem autenticação real. Os indicadores de atividade continuam sem números porque representam projetos/grupos e não inscrições académicas.

O questionário local de 18 perguntas permanece separado do questionário oficial. Inscrições académicas são lidas para Carla/Diogo, mas a sua apresentação detalhada e eventual adição de notas ficam para o Issue do ecrã Notas. Projetos, grupos, matching e autenticação real ficam para Issues próprios.

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
