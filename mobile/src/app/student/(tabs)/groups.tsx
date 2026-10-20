import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppCard } from '@/components/AppCard';
import { EmptyState } from '@/components/EmptyState';
import { SegmentedControl } from '@/components/SegmentedControl';
import { demoGroups, type DemoGroup } from '@/features/student/data';
import { GroupCard } from '@/features/student/StudentCards';
import { StudentPage } from '@/features/student/StudentPage';

const options = [{ label: 'Ativos', value: 'active' }, { label: 'Concluídos', value: 'completed' }] as const;

export default function Groups() {
  const router = useRouter();
  const { status } = useLocalSearchParams<{ status?: string }>();
  const tab: DemoGroup['status'] = status === 'completed' ? 'completed' : 'active';
  const groups = demoGroups.filter((g) => g.status === tab);
  return (
    <StudentPage title="Os meus grupos" subtitle="Grupos de exemplo, sem resultados de matching.">
      <SegmentedControl label="Lista de grupos" options={options} value={tab} onChange={(value) => router.setParams({ status: value })} />
      {groups.length ? groups.map((group) => <GroupCard key={group.id} group={group} />) : (
        <AppCard><EmptyState title={tab === 'completed' ? 'Ainda sem grupos concluídos' : 'Ainda sem grupos ativos'} description={tab === 'completed' ? 'Os grupos terminados vão ficar disponíveis neste espaço.' : 'Os teus grupos vão aparecer aqui quando fizeres parte de uma equipa.'} /></AppCard>
      )}
    </StudentPage>
  );
}
