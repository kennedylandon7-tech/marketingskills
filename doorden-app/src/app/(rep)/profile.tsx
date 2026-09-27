import { router } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Muted, Row, Screen, Section, Title } from '../../components/ui';
import { repStats, useStore } from '../../lib/store';
import { colors, radius } from '../../lib/theme';

function level(value: number, steps: number[]) {
  const lvl = steps.filter((s) => value >= s).length;
  const next = steps[lvl];
  const prev = steps[lvl - 1] ?? 0;
  return { lvl, progress: next ? (value - prev) / (next - prev) : 1, next };
}

export default function Skills() {
  const { state, dispatch } = useStore();
  const st = repStats(state);

  const skills = [
    { emoji: '🚶', name: 'Hustle', desc: 'Doors knocked', value: st.doors, steps: [25, 100, 300, 1000] },
    { emoji: '🤝', name: 'Closing', desc: 'Yeses logged', value: st.closes, steps: [1, 10, 30, 100] },
    { emoji: '✅', name: 'Trust', desc: 'Offers homeowners verified', value: st.verified, steps: [1, 8, 25, 80] },
    { emoji: '🗣️', name: 'Pitch', desc: 'Close rate (per 100 doors)', value: Math.round(st.closeRate * 100), steps: [3, 6, 10, 15] },
  ];

  const signOut = () =>
    Alert.alert('Switch role', 'Go back to the welcome screen? Your data stays on this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Switch',
        onPress: () => {
          dispatch({ type: 'setRole', role: null });
          router.replace('/');
        },
      },
    ]);

  return (
    <Screen>
      <Title sub="Skills you build with Doorden, instead of miles on your car.">Your skills</Title>

      {skills.map((sk) => {
        const l = level(sk.value, sk.steps);
        return (
          <Card key={sk.name}>
            <Row>
              <Text style={{ fontSize: 28 }}>{sk.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Text style={{ fontWeight: '800', fontSize: 16 }}>{sk.name}</Text>
                  <Text style={{ fontWeight: '800', color: colors.primary }}>Lv {l.lvl}</Text>
                </Row>
                <Muted>
                  {sk.desc}: {sk.value}
                  {l.next ? ` / ${l.next}` : ' · maxed'}
                </Muted>
                <View style={s.track}>
                  <View style={[s.fill, { width: `${Math.max(4, l.progress * 100)}%` }]} />
                </View>
              </View>
            </Row>
          </Card>
        );
      })}

      <Section title="What you're really learning">
        <Card>
          <Muted>
            Cold outreach, handling objections, pricing, and closing. The same skills that pay in sales, real estate,
            and running your own business. Put them on your resume.
          </Muted>
        </Card>
      </Section>

      <Button label="Switch role" kind="ghost" onPress={signOut} style={{ marginTop: 16 }} />
      <Button
        label="Reset demo data"
        kind="ghost"
        textColor={colors.danger}
        style={{ marginTop: 10, borderColor: colors.danger }}
        onPress={() => {
          dispatch({ type: 'reset' });
          router.replace('/');
        }}
      />
    </Screen>
  );
}

const s = StyleSheet.create({
  track: { height: 8, backgroundColor: colors.border, borderRadius: radius.pill, marginTop: 8, overflow: 'hidden' },
  fill: { height: 8, backgroundColor: colors.primary, borderRadius: radius.pill },
});
