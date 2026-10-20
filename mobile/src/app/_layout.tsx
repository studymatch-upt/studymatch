import { Stack } from 'expo-router';

import { ThemeProvider } from '@/theme/ThemeProvider';
import { DemoSessionProvider, useDemoSession } from '@/features/student/DemoSession';

function Navigation() {
  const { studentActive } = useDemoSession();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!studentActive} redirectTo="/student">
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="demo" />
      </Stack.Protected>
      <Stack.Protected guard={studentActive} redirectTo="/">
        <Stack.Screen name="student" />
      </Stack.Protected>
      <Stack.Screen name="design-system" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <DemoSessionProvider>
        <Navigation />
      </DemoSessionProvider>
    </ThemeProvider>
  );
}
