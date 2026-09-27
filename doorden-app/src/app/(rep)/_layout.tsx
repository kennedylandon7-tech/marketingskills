import { Tabs } from 'expo-router/js-tabs';

import { tabIcon as icon } from '../../components/TabIcon';
import { colors } from '../../lib/theme';

export default function RepTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: colors.border },
        tabBarLabelStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Knock', tabBarIcon: icon('🚪') }} />
      <Tabs.Screen name="businesses" options={{ title: 'Businesses', tabBarIcon: icon('🧰') }} />
      <Tabs.Screen name="leads" options={{ title: 'Leads', tabBarIcon: icon('📋') }} />
      <Tabs.Screen name="earnings" options={{ title: 'Earnings', tabBarIcon: icon('💵') }} />
      <Tabs.Screen name="profile" options={{ title: 'Skills', tabBarIcon: icon('🏆') }} />
    </Tabs>
  );
}
