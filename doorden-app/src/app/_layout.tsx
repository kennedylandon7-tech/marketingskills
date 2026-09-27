import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { StoreProvider } from '../lib/store';
import { colors } from '../lib/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.primary,
            headerTitleStyle: { color: colors.text, fontWeight: '700' },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(rep)" />
          <Stack.Screen name="(business)" />
          <Stack.Screen name="verify" options={{ headerShown: true, title: 'Verify your offer' }} />
          <Stack.Screen name="new-lead" options={{ presentation: 'modal', headerShown: true, title: 'Log a yes' }} />
          <Stack.Screen name="neighborhoods" options={{ presentation: 'modal', headerShown: true, title: 'Pick a neighborhood' }} />
          <Stack.Screen name="business/[id]" options={{ headerShown: true, title: 'Price guideline' }} />
        </Stack>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
