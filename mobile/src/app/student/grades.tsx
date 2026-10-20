import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppInput } from '@/components/AppInput';
import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { formatGrade, gradeSummary, groupHistories, searchCourseUnits, suggestedAttempt, validateGradeInput } from '@/features/student/academicGrades';
import { useDemoSession } from '@/features/student/DemoSession';
import { OfficialDataStatus } from '@/features/student/OfficialDataStatus';
import { addStudentGrade, getCourseUnits, type ApiCourseUnit } from '@/features/student/studentApi';
import { StudentPage, studentStyles } from '@/features/student/StudentPage';
import { useTheme } from '@/theme/ThemeProvider';
import { borderWidth, opacity, radius, spacing } from '@/theme/tokens';

export default function GradesScreen() {
  const { colors } = useTheme();
  const { official, refreshOfficial } = useDemoSession();
  const [catalog, setCatalog] = useState<ApiCourseUnit[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [catalogReady, setCatalogReady] = useState(false);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<ApiCourseUnit | null>(null);
  const [grade, setGrade] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [attempt, setAttempt] = useState('1');
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  async function loadCatalog() {
    setCatalogLoading(true);
    setCatalogError(null);
    try {
      setCatalog(await getCourseUnits());
      setCatalogReady(true);
    } catch (error) {
      setCatalogError(error instanceof Error ? error.message : 'Não foi possível carregar as cadeiras.');
    } finally {
      setCatalogLoading(false);
    }
  }

  const studentId = official?.student.id;
  useEffect(() => {
    if (!studentId) return;
    let active = true;
    void getCourseUnits().then((units) => {
      if (active) { setCatalog(units); setCatalogReady(true); setCatalogError(null); }
    }).catch((error: unknown) => {
      if (active) setCatalogError(error instanceof Error ? error.message : 'Não foi possível carregar as cadeiras.');
    }).finally(() => {
      if (active) setCatalogLoading(false);
    });
    return () => { active = false; };
  }, [studentId]);

  const summary = useMemo(() => gradeSummary(official?.enrollments ?? []), [official?.enrollments]);
  const groups = useMemo(() => groupHistories(official?.enrollments ?? [], catalog), [official?.enrollments, catalog]);
  const matches = useMemo(() => searchCourseUnits(catalog, query), [catalog, query]);

  function chooseUnit(unit: ApiCourseUnit) {
    setSelectedUnit(unit);
    setQuery(unit.name);
    setAttempt(String(suggestedAttempt(unit.code, official?.enrollments ?? [])));
    setFormError(null);
  }

  function resetForm() {
    setFormOpen(false);
    setQuery('');
    setSelectedUnit(null);
    setGrade('');
    setAcademicYear('');
    setAttempt('1');
    setFormError(null);
  }

  async function saveGrade() {
    if (!official || !selectedUnit || savingRef.current || !__DEV__) return;
    savingRef.current = true;
    setSaving(true);
    setFormError(null);
    try {
      await addStudentGrade(official.student.id, {
        courseUnitCode: selectedUnit.code, grade, academicYear, attempt,
      }, catalog, official.enrollments);
      resetForm();
      const updated = await refreshOfficial();
      setNotice(updated ? 'Nota guardada. As notas e o perfil foram atualizados.' : 'Nota guardada, mas a atualização falhou. Usa “Atualizar dados”; não voltes a adicionar a nota.');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível adicionar a nota.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  function confirmGrade() {
    if (!official || !__DEV__ || savingRef.current) return;
    try {
      const input = validateGradeInput({ courseUnitCode: selectedUnit?.code ?? '', grade, academicYear, attempt }, catalog, official.enrollments);
      setFormError(null);
      Alert.alert('Confirmar nota', `${official.student.name}\n${selectedUnit?.name}\n${formatGrade(input.grade)} valores · ${input.academicYear}/${String((input.academicYear + 1) % 100).padStart(2, '0')} · tentativa ${input.attempt}`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Adicionar nota', onPress: () => void saveGrade() },
      ]);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Verifica os dados da nota.');
    }
  }

  return <StudentPage detail compactHeader title="Notas" subtitle={official ? `Histórico académico · ${official.student.name}` : 'Média simples e histórico académico'}>
    {official ? <>
      <OfficialDataStatus />
      {notice && <AppText variant="caption" tone="accent" accessibilityRole="alert">{notice}</AppText>}
      <AppCard style={styles.summaryCard}>
        <View style={studentStyles.spread}>
          <AppText variant="label">Média simples</AppText>
          <AppText variant="caption" tone="secondary">Escala 0–20</AppText>
        </View>
        <View style={styles.summaryRow}>
          <AppText variant="title" tone="accent">{summary.mean === null ? '—' : formatGrade(summary.mean)}</AppText>
          <AppText variant="caption" tone="secondary">{summary.count} {summary.count === 1 ? 'cadeira avaliada' : 'cadeiras avaliadas'}</AppText>
        </View>
        <AppText variant="caption" tone="secondary">Conta uma nota por cadeira: a tentativa com nota mais recente. Não é o Overall de competências.</AppText>
      </AppCard>

      <View style={studentStyles.spread}>
        <AppText variant="heading" accessibilityRole="header">Histórico</AppText>
        {__DEV__ && <AppButton title={formOpen ? 'Fechar' : '+ Adicionar nota'} size="sm" variant="secondary" disabled={saving} onPress={() => { if (formOpen) resetForm(); else { setNotice(null); setFormOpen(true); } }} />}
      </View>

      {formOpen && __DEV__ && <AppCard style={styles.form}>
        <AppText variant="label">Nova nota · sessão de teste</AppText>
        <AppText variant="caption" tone="secondary">Escolhe uma cadeira do catálogo. Esta ação altera os dados do backend de demonstração.</AppText>
        {catalogLoading && <LoadingState message="A carregar catálogo..." />}
        {catalogError && <AppText variant="caption" tone="secondary" accessibilityRole="alert">{catalogError}</AppText>}
        <AppInput label="Unidade curricular" placeholder="Pesquisar nome ou código" value={query} onChangeText={(text) => { setQuery(text); setSelectedUnit(null); }} autoCorrect={false} />
        {selectedUnit ? <AppText variant="caption" tone="accent">Selecionada: {selectedUnit.code} · {selectedUnit.name}</AppText> : query.trim() && catalogReady ? (
          matches.length ? <View style={styles.results}>{matches.map((unit) => <Pressable key={unit.id} accessibilityRole="button" accessibilityLabel={`Selecionar ${unit.name}`} onPress={() => chooseUnit(unit)} style={({ pressed }) => [styles.result, { borderColor: colors.border }, pressed && styles.pressed]}>
            <AppText variant="label">{unit.name}</AppText>
            <AppText variant="caption" tone="secondary">{unit.code} · {unit.curricularYear}.º ano · {unit.semester}.º semestre</AppText>
          </Pressable>)}</View> : <AppText variant="caption" tone="secondary">Nenhuma cadeira do catálogo corresponde à pesquisa.</AppText>
        ) : null}
        <AppInput label="Nota (0 a 20)" placeholder="Ex.: 14,5" value={grade} onChangeText={setGrade} keyboardType="decimal-pad" />
        <AppInput label="Ano letivo — ano inicial" placeholder="Ex.: 2025 para 2025/26" value={academicYear} onChangeText={setAcademicYear} keyboardType="number-pad" maxLength={4} />
        <AppInput label="Tentativa" value={attempt} onChangeText={setAttempt} keyboardType="number-pad" maxLength={2} hint="Para uma cadeira sem histórico, começa em 1." />
        {formError && <AppText variant="caption" tone="secondary" accessibilityRole="alert">{formError}</AppText>}
        <AppButton title="Confirmar e adicionar" loading={saving} disabled={!selectedUnit || catalogLoading || !catalogReady} onPress={confirmGrade} />
      </AppCard>}

      {catalogLoading && !catalogReady && <LoadingState message="A organizar notas pelo catálogo..." />}
      {catalogError && !catalogReady && <AppCard style={styles.stack}>
        <AppText variant="caption" tone="secondary" accessibilityRole="alert">{catalogError}</AppText>
        <AppButton title="Tentar novamente" variant="outline" size="sm" onPress={() => void loadCatalog()} />
      </AppCard>}
      {catalogReady && catalog.length === 0 && <AppText variant="caption" tone="secondary">O catálogo está vazio. As inscrições aparecem sem classificação curricular.</AppText>}
      {catalogReady && (groups.length === 0 ? <EmptyState title="Ainda sem notas" description="Este aluno ainda não tem unidades curriculares associadas. As notas serão apresentadas aqui depois de registadas." /> : groups.map((group) => <View key={group.key} style={styles.stack}>
        <AppText variant="label" accessibilityRole="header">{group.title}</AppText>
        {group.courses.map((course) => {
          const isExpanded = expanded.includes(course.code);
          return <AppCard key={course.code} style={styles.courseCard}>
            <View style={studentStyles.spread}>
              <View style={studentStyles.flex}>
                <AppText variant="label">{course.name}</AppText>
                <AppText variant="caption" tone="secondary">{course.code} · {course.attempts.length} {course.attempts.length === 1 ? 'tentativa' : 'tentativas'}</AppText>
              </View>
              <AppText variant="heading" tone="accent">{course.latestGraded?.grade == null ? '—' : formatGrade(course.latestGraded.grade)}</AppText>
            </View>
            {course.attempts.length === 1 ? <AppText variant="caption" tone="secondary">{course.attempts[0].academicYearLabel} · tentativa {course.attempts[0].attempt} · {course.attempts[0].grade == null ? 'Sem nota' : 'Com nota'}</AppText> : <>
              <AppButton title={isExpanded ? 'Ocultar tentativas' : 'Ver tentativas'} variant="outline" size="sm" onPress={() => setExpanded((current) => isExpanded ? current.filter((code) => code !== course.code) : [...current, course.code])} />
              {isExpanded && course.attempts.map((item, index) => <View key={item.id} style={[styles.attemptRow, { borderTopColor: colors.border }]}>
                <AppText variant="caption" tone="secondary">{item.academicYearLabel} · tentativa {item.attempt} · {index === 0 ? 'Mais recente' : 'Anterior'}</AppText>
                <AppText variant="label">{item.grade == null ? 'Sem nota' : formatGrade(item.grade)}</AppText>
              </View>)}
            </>}
          </AppCard>;
        })}
      </View>))}
    </> : <EmptyState title="Sem dados académicos" description="As notas só estão disponíveis para Carla ou Diogo na sessão de desenvolvimento ligada ao backend." />}
  </StudentPage>;
}

const styles = StyleSheet.create({
  stack: { gap: spacing.sm },
  summaryCard: { gap: spacing.sm },
  summaryRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  form: { gap: spacing.md },
  results: { gap: spacing.xs },
  result: { borderWidth: borderWidth.thin, borderRadius: radius.md, padding: spacing.sm, gap: spacing.xxs },
  courseCard: { gap: spacing.sm },
  attemptRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm, paddingTop: spacing.xs, borderTopWidth: borderWidth.thin },
  pressed: { opacity: opacity.pressed },
});
