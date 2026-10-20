import { useLocalSearchParams } from 'expo-router';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { demoGroups } from '@/features/student/data';
import { StudentPage, studentStyles } from '@/features/student/StudentPage';

export default function GroupDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const group = demoGroups.find((g) => g.id === id);
  return (
    <StudentPage detail title={group?.title ?? 'Grupo indisponível'} subtitle="Grupo demonstrativo">
      {group ? <>
        <AppCard style={studentStyles.stack}>
          <AppText variant="label">{group.course}</AppText>
          <AppText tone="secondary">{group.members} membros neste exemplo.</AppText>
          <AppText variant="caption" tone="secondary">Este grupo é fictício e não resulta do algoritmo de matching.</AppText>
        </AppCard>
        <AppCard><EmptyState title="Conhece a tua equipa" description="Os membros e as suas competências dominantes vão aparecer aqui numa próxima fase." /></AppCard>
      </> : <EmptyState title="Não encontrámos este grupo" description="Volta à lista para explorares os grupos de exemplo." />}
    </StudentPage>
  );
}
