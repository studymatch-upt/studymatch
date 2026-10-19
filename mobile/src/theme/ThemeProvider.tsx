import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { useColorScheme } from 'react-native';

import { palettes, type Palette } from './colors';

export type ThemePreference = 'system' | 'light' | 'dark';
type ResolvedTheme = 'light' | 'dark';

type ThemeContextValue = {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  colors: Palette;
  setPreference: (next: ThemePreference) => void;
};

const storageKey = 'studymatch.theme';
const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemTheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const changedByUser = useRef(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(storageKey)
      .then((saved) => {
        if (mounted && !changedByUser.current && isThemePreference(saved)) {
          setPreferenceState(saved);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    changedByUser.current = true;
    setPreferenceState(next);
    void AsyncStorage.setItem(storageKey, next).catch(() => {});
  }, []);

  const resolvedTheme: ResolvedTheme =
    preference === 'system' ? (systemTheme === 'dark' ? 'dark' : 'light') : preference;

  const value = useMemo(
    () => ({ preference, resolvedTheme, colors: palettes[resolvedTheme], setPreference }),
    [preference, resolvedTheme, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useTheme must be used inside ThemeProvider');
  return theme;
}
