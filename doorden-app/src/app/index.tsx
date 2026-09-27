import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, styles as ui } from '../components/ui';
import { useStore } from '../lib/store';
import { colors, radius } from '../lib/theme';
import type { Role } from '../lib/types';

const roles: { role: Role; emoji: string; title: string; body: string }[] = [
  { role: 'rep', emoji: '🚪', title: 'I want to earn', body: 'Knock doors on your schedule. Earn a 12% bonus on every job you close.' },
  { role: 'business', emoji: '🧰', title: 'I run a local business', body: 'Get free, homeowner-verified jobs. Keep 100% of every job.' },
  { role: 'homeowner', emoji: '🏡', title: 'I got a quote', body: 'Verify the offer a rep gave you at your door.' },
];

export default function Welcome() {
  const { state, dispatch, ready } = useStore();
  const [picked, setPicked] = useState<Role | null>(null);
  const [name, setName] = useState('');

  if (!ready) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />;
  if (state.role === 'rep') return <Redirect href="/(rep)" />;
  if (state.role === 'business') return <Redirect href="/(business)" />;
  if (state.role === 'homeowner') return <Redirect href="/verify" />;

  const go = () => {
    if (!picked) return;
    if (picked === 'rep') dispatch({ type: 'setRepName', name: name.trim() || 'Rep' });
    dispatch({ type: 'setRole', role: picked });
    router.replace(picked === 'rep' ? '/(rep)' : picked === 'business' ? '/(business)' : '/verify');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.primaryDark }}>
      <SafeAreaView style={{ flex: 1, padding: 20 }}>
        <Text style={s.logo}>doorden</Text>
        <Text style={s.hero}>Get paid to knock.{'\n'}Skills, not miles.</Text>
        <Text style={s.tag}>No car. No gas. No boss. Pick a neighborhood, walk, and close local jobs.</Text>

        <View style={{ marginTop: 28, gap: 10 }}>
          {roles.map((r) => (
            <Pressable
              key={r.role}
              onPress={() => setPicked(r.role)}
              style={[s.role, picked === r.role && { borderColor: colors.accent, backgroundColor: '#12573F' }]}
            >
              <Text style={{ fontSize: 28 }}>{r.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.roleTitle}>{r.title}</Text>
                <Text style={s.roleBody}>{r.body}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {picked === 'rep' ? (
          <TextInput
            placeholder="Your first name"
            placeholderTextColor={colors.muted}
            value={name}
            onChangeText={setName}
            style={[ui.input, { marginTop: 16 }]}
          />
        ) : null}

        <View style={{ flex: 1 }} />
        <Button label="Get started" kind="accent" disabled={!picked} onPress={go} />
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  logo: { color: colors.accent, fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  hero: { color: '#fff', fontSize: 34, fontWeight: '900', marginTop: 24, letterSpacing: -1 },
  tag: { color: '#CFE3D8', fontSize: 16, marginTop: 10, lineHeight: 22 },
  role: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    padding: 16,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: '#1E5C45',
  },
  roleTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
  roleBody: { color: '#CFE3D8', fontSize: 13, marginTop: 2 },
});
