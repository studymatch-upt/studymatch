import { useLocalSearchParams } from 'expo-router';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { demoProjects } from '@/features/student/data';
import { StudentPage, studentStyles } from '@/features/student/StudentPage';

export default function ProjectDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const project = demoProjects.find((p) => p.id === id);
  return (
    <StudentPage detail title={project?.title ?? 'Projeto indisponível'} subtitle="Projeto demonstrativo">
      {project ? <>
        <AppCard style={studentStyles.stack}>
          <AppText variant="label">{project.area}</AppText>
          <AppText tone="secondary">{project.description}</AppText>
        </AppCard>
        <AppCard><EmptyState title="Inscrições em breve" description="Aqui poderás consultar os detalhes e inscrever-te. Este exemplo não permite inscrições reais." /></AppCard>
      </> : <EmptyState title="Não encontrámos este projeto" description="Volta à lista para explorares os exemplos disponíveis." />}
    </StudentPage>
  );
}
