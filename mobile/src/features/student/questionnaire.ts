export const competencies = [
  { key: 'PROGRAMMING', title: 'Programação', description: 'Resolver problemas com código.', questions: [
    'Sinto-me à vontade a escrever código para resolver problemas.',
    'Consigo identificar e corrigir erros no código que desenvolvo.',
    'Consigo implementar uma funcionalidade a partir de requisitos definidos.',
  ] },
  { key: 'MATHEMATICS_AND_LOGIC', title: 'Matemática e Lógica', description: 'Pensar de forma estruturada.', questions: [
    'Consigo dividir problemas complexos em passos lógicos mais simples.',
    'Sinto-me confortável a utilizar raciocínio matemático para resolver problemas.',
    'Consigo analisar diferentes soluções e identificar a mais adequada para um problema lógico.',
  ] },
  { key: 'DATABASES', title: 'Bases de Dados', description: 'Estruturar e consultar informação.', questions: [
    'Consigo criar consultas SQL para obter informações de uma base de dados.',
    'Consigo organizar dados em tabelas e definir relações entre elas.',
    'Consigo identificar problemas na estrutura de uma base de dados e propor melhorias.',
  ] },
  { key: 'DESIGN_AND_UX', title: 'Design e UX', description: 'Criar experiências claras.', questions: [
    'Consigo organizar os elementos de uma interface para facilitar a sua utilização.',
    'Tenho facilidade em criar layouts visualmente consistentes.',
    'Consigo identificar dificuldades de utilização numa aplicação e sugerir melhorias.',
  ] },
  { key: 'COMMUNICATION', title: 'Comunicação', description: 'Partilhar ideias com clareza.', questions: [
    'Consigo explicar ideias técnicas de forma clara aos meus colegas.',
    'Sinto-me confortável a apresentar trabalhos perante outras pessoas.',
    'Consigo escrever documentação que outras pessoas compreendam facilmente.',
  ] },
  { key: 'ORGANISATION_AND_LEADERSHIP', title: 'Organização e Liderança', description: 'Planear e coordenar tarefas.', questions: [
    'Consigo organizar as minhas tarefas de forma a cumprir os prazos definidos.',
    'Tenho facilidade em coordenar tarefas entre diferentes membros de uma equipa.',
    'Consigo identificar prioridades quando existem várias tarefas por concluir.',
  ] },
] as const;

export type Competency = typeof competencies[number]['key'];
export type Answer = 1 | 2 | 3 | 4 | 5;
export type Answers = (Answer | null)[];
export type AggregatedAnswers = Record<Competency, Answer>;

export const scale = [
  { value: 1, label: 'Discordo totalmente' },
  { value: 2, label: 'Discordo' },
  { value: 3, label: 'Nem concordo nem discordo' },
  { value: 4, label: 'Concordo' },
  { value: 5, label: 'Concordo totalmente' },
] as const;

export const emptyAnswers = (): Answers => Array.from({ length: 18 }, () => null);

export function isAnswer(value: unknown): value is Answer {
  return Number.isInteger(value) && typeof value === 'number' && value >= 1 && value <= 5;
}

export function answeredCount(answers: Answers): number {
  return answers.filter(isAnswer).length;
}

// Mobile compatibility rule: three answers become the API's one 1–5 value per competency.
// This does not calculate the backend's academic competency profile.
export function aggregateAnswers(answers: Answers): AggregatedAnswers {
  if (answers.length !== 18 || answers.some((answer) => !isAnswer(answer))) {
    throw new Error('All 18 questionnaire answers must be between 1 and 5.');
  }
  return Object.fromEntries(competencies.map((competency, group) => {
    const first = group * 3;
    const mean = (answers[first]! + answers[first + 1]! + answers[first + 2]!) / 3;
    return [competency.key, Math.round(mean) as Answer];
  })) as AggregatedAnswers;
}
