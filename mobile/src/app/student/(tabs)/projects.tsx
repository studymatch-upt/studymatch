import { useState } from 'react';
import { AppCard } from '@/components/AppCard';
import { EmptyState } from '@/components/EmptyState';
import { SegmentedControl } from '@/components/SegmentedControl';
import { demoProjects, type DemoProject } from '@/features/student/data';
import { ProjectCard } from '@/features/student/StudentCards';
import { StudentPage } from '@/features/student/StudentPage';

const options = [{ label: 'Disponíveis', value: 'available' }, { label: 'Inscrições', value: 'enrolled' }] as const;

export default function Projects() {
  const [tab, setTab] = useState<DemoProject['status']>('available');
  const projects = demoProjects.filter((p) => p.status === tab);
  return (
    <StudentPage title="Projetos" subtitle="Explora possibilidades. Os projetos apresentados são exemplos.">
      <SegmentedControl label="Lista de projetos" options={options} value={tab} onChange={setTab} />
      {projects.length ? projects.map((project) => <ProjectCard key={project.id} project={project} />) : (
        <AppCard><EmptyState title={tab === 'enrolled' ? 'Ainda sem inscrições' : 'Sem projetos disponíveis'} description={tab === 'enrolled' ? 'Quando te inscreveres num projeto, vais encontrá-lo aqui. As inscrições reais ficam para uma próxima fase.' : 'Os novos projetos vão aparecer aqui quando estiverem disponíveis.'} /></AppCard>
      )}
    </StudentPage>
  );
}
