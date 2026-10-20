import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { StudentPage, studentStyles } from '@/features/student/StudentPage';

export default function Competencies() {
  return (
    <StudentPage detail title="Competências" subtitle="Conhece as áreas que vão compor o teu perfil.">
      <AppCard><EmptyState title="O teu radar começa aqui" description="Este espaço está reservado para o perfil de competências. Ainda não existem pontuações calculadas nesta demonstração." /></AppCard>
      <AppCard style={studentStyles.stack}>
        <AppText variant="label" accessibilityRole="header">Seis áreas de competências</AppText>
        {['Programação', 'Organização', 'Matemática e Lógica', 'Comunicação', 'Bases de Dados', 'Design & UX'].map((area) => <AppText key={area} variant="body" tone="secondary">{area}</AppText>)}
      </AppCard>
      <AppText variant="caption" tone="secondary">O questionário e o cálculo com base no percurso académico serão implementados numa próxima fase.</AppText>
    </StudentPage>
  );
}
