import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { AppBadge } from '@/components/AppBadge';
import { useTheme } from '@/theme/ThemeProvider';
import { opacity, spacing } from '@/theme/tokens';
import { StudentIcon } from './StudentIcon';
import { studentStyles } from './StudentPage';
import type { DemoGroup, DemoProject } from './data';

export function ProjectCard({ project }: { project: DemoProject }) {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Ver projeto ${project.title}, exemplo`} onPress={() => router.push({ pathname: '/student/project/[id]', params: { id: project.id } })} style={({ pressed }) => pressed && styles.pressed}>
      <AppCard style={studentStyles.stack}>
        <View style={studentStyles.spread}>
          <AppText variant="label" style={studentStyles.flex}>{project.title}</AppText>
          <AppBadge label={project.status === 'available' ? 'Aberto' : 'Inscrito'} status="info" />
        </View>
        <AppText variant="caption" tone="secondary">{project.area}</AppText>
        <View style={studentStyles.spread}>
          <AppText variant="caption" tone="accent">Explorar exemplo</AppText>
          <StudentIcon name="arrow" color={colors.accentText} size={16} />
        </View>
      </AppCard>
    </Pressable>
  );
}

export function GroupCard({ group }: { group: DemoGroup }) {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Ver grupo ${group.title}, exemplo`} onPress={() => router.push({ pathname: '/student/group/[id]', params: { id: group.id } })} style={({ pressed }) => pressed && styles.pressed}>
      <AppCard style={studentStyles.stack}>
        <View style={studentStyles.spread}>
          <View style={[studentStyles.copy, studentStyles.flex]}>
            <AppText variant="label">{group.title}</AppText>
            <AppText variant="caption" tone="secondary">{group.course}</AppText>
          </View>
          <StudentIcon name="arrow" color={colors.textSecondary} size={16} />
        </View>
        <View style={styles.members}>
          <StudentIcon name="groups" color={colors.accentText} size={16} />
          <AppText variant="caption" tone="secondary">{group.members} membros · Exemplo</AppText>
        </View>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: opacity.pressed },
  members: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
