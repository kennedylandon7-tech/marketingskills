import { Tabs } from 'expo-router/js-tabs';

import { tabIcon as icon } from '../../components/TabIcon';
import { colors } from '../../lib/theme';

export default function BusinessTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Jobs', tabBarIcon: icon('📥') }} />
      <Tabs.Screen name="services" options={{ title: 'Pricing', tabBarIcon: icon('🏷️') }} />
      <Tabs.Screen name="account" options={{ title: 'Account', tabBarIcon: icon('🧰') }} />
    </Tabs>
  );
}
