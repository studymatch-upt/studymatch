export const demoStudent = {
  name: 'Alykhan Jamal', firstName: 'Alykhan', course: 'Engenharia Informática',
  number: '20260001', year: '4.º ano',
};

export type DemoProject = {
  id: string; title: string; area: string; description: string;
  status: 'available' | 'enrolled';
};
export const demoProjects: DemoProject[] = [
  { id: 'sistemas-distribuidos', title: 'Sistemas Distribuídos', area: 'Backend · Sistemas distribuídos', status: 'available', description: 'Exemplo de projeto para explorar comunicação entre serviços e aplicações distribuídas.' },
  { id: 'bases-de-dados', title: 'Bases de Dados', area: 'SQL · Modelação de dados', status: 'available', description: 'Exemplo de projeto de desenho e consulta de uma base de dados relacional.' },
  { id: 'desenvolvimento-aplicacoes', title: 'Desenvolvimento de Aplicações', area: 'Mobile · Full stack', status: 'available', description: 'Exemplo de projeto de conceção de uma aplicação e dos seus principais percursos.' },
];

export type DemoGroup = {
  id: string; title: string; course: string; members: number; status: 'active' | 'completed';
};
export const demoGroups: DemoGroup[] = [
  { id: 'grupo-sd', title: 'Projeto de SD', course: 'Sistemas Distribuídos', members: 4, status: 'active' },
  { id: 'grupo-bd', title: 'Projeto de BD', course: 'Bases de Dados', members: 3, status: 'active' },
];
