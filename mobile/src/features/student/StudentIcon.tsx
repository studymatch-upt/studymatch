import { View } from 'react-native';

export type StudentIconName = 'home' | 'projects' | 'groups' | 'profile' | 'calendar' | 'arrow';
type Line = [number, number, number, number];
const paths: Record<StudentIconName, Line[]> = {
  home: [[3, 11, 12, 3], [12, 3, 21, 11], [6, 10, 6, 21], [6, 21, 18, 21], [18, 21, 18, 10], [10, 21, 10, 15], [10, 15, 14, 15], [14, 15, 14, 21]],
  projects: [[3, 7, 10, 7], [10, 7, 12, 10], [12, 10, 21, 10], [21, 10, 21, 20], [21, 20, 3, 20], [3, 20, 3, 7], [7, 7, 7, 4], [7, 4, 18, 4], [18, 4, 18, 7]],
  groups: [[3, 21, 4, 16], [4, 16, 9, 14], [9, 14, 14, 16], [14, 16, 15, 21], [16, 14, 20, 16], [20, 16, 21, 21]],
  profile: [[4, 21, 5, 17], [5, 17, 9, 14], [9, 14, 15, 14], [15, 14, 19, 17], [19, 17, 20, 21]],
  calendar: [[3, 6, 21, 6], [21, 6, 21, 21], [21, 21, 3, 21], [3, 21, 3, 6], [3, 11, 21, 11], [7, 3, 7, 8], [17, 3, 17, 8]],
  arrow: [[9, 5, 16, 12], [16, 12, 9, 19]],
};

// Small outline icons built from native views, with no additional dependency.
export function StudentIcon({ name, color, size = 24 }: { name: StudentIconName; color: string; size?: number }) {
  const scale = size / 24;
  const circles = name === 'profile' ? [[12, 7, 4]] : name === 'groups' ? [[9, 7, 3.5], [18, 8, 2.5]] : [];
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: size, height: size }}>
      {paths[name].map(([x1, y1, x2, y2], i) => {
        const length = Math.hypot(x2 - x1, y2 - y1) * scale;
        return <View key={i} style={{ position: 'absolute', backgroundColor: color, height: 1.6 * scale, borderRadius: scale, width: length, left: (x1 + x2) / 2 * scale - length / 2, top: (y1 + y2) / 2 * scale - 0.8 * scale, transform: [{ rotate: `${Math.atan2(y2 - y1, x2 - x1)}rad` }] }} />;
      })}
      {circles.map(([x, y, r], i) => <View key={`circle-${i}`} style={{ position: 'absolute', left: (x - r) * scale, top: (y - r) * scale, width: r * 2 * scale, height: r * 2 * scale, borderRadius: r * scale, borderWidth: 1.6 * scale, borderColor: color }} />)}
    </View>
  );
}
