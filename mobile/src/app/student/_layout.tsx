import { Stack } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { useDemoSession } from '@/features/student/DemoSession';

export default function StudentLayout() {
  const { colors } = useTheme();
  const { record, official } = useDemoSession();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
    <Stack.Screen name="questionnaire" />
    <Stack.Screen name="questionnaire-complete" />
    <Stack.Protected guard={record.completed || official !== null} redirectTo="/student/questionnaire">
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="competencies" />
      <Stack.Screen name="grades" />
      <Stack.Screen name="project/[id]" />
      <Stack.Screen name="group/[id]" />
    </Stack.Protected>
  </Stack>;
}
