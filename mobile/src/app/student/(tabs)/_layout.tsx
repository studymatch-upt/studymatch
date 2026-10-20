import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StudentIcon, type StudentIconName } from '@/features/student/StudentIcon';
import { useTheme } from '@/theme/ThemeProvider';
import { fontSize, fontWeight, spacing } from '@/theme/tokens';

const tabs: { name: string; title: string; icon: StudentIconName }[] = [
  { name: 'index', title: 'Início', icon: 'home' },
  { name: 'projects', title: 'Projetos', icon: 'projects' },
  { name: 'groups', title: 'Grupos', icon: 'groups' },
  { name: 'profile', title: 'Perfil', icon: 'profile' },
];

export default function StudentTabs() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tabs backBehavior="initialRoute" screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.accentText,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarActiveBackgroundColor: colors.surfaceRaised,
      tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border, height: 64 + insets.bottom, paddingTop: spacing.xs, paddingBottom: Math.max(insets.bottom, spacing.xs) },
      tabBarLabelStyle: { fontSize: fontSize.caption, fontWeight: fontWeight.medium },
      sceneStyle: { backgroundColor: colors.background },
    }}>
      {tabs.map((tab) => <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.title, tabBarIcon: ({ focused }) => <StudentIcon name={tab.icon} color={focused ? colors.accentText : colors.textSecondary} size={22} /> }} />)}
    </Tabs>
  );
}
