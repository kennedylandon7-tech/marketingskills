import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Muted, Pill, Row, Screen, Section, Stat, StatusPill } from '../../components/ui';
import { money, repStats, useStore } from '../../lib/store';
import { colors, radius } from '../../lib/theme';

const pitches = [
  { title: 'Driveway opener', body: '"Hi! I\'m working with a local power washing crew that\'s doing driveways on this street this week. Yours would be $150, want me to lock you in?"' },
  { title: 'Windows opener', body: '"Hey, quick one. Crystal Clear is doing windows in the neighborhood. Outside panes run about $8 a window. Want a quote for your place?"' },
  { title: 'Handling "not right now"', body: '"Totally get it. No payment today. You just confirm the price in the app and the business calls you to schedule when it works."' },
];

function elapsed(ms: number) {
  const m = Math.floor(ms / 60000);
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`;
}

export default function Knock() {
  const { state, dispatch } = useStore();
  const [, tick] = useState(0);
  const active = state.shifts.find((s) => !s.endedAt);
  const hood = state.neighborhoods.find((n) => n.id === (active?.neighborhoodId ?? state.selectedNeighborhoodId));
  const stats = repStats(state);
  const recent = state.leads.slice(0, 3);

  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => tick((x) => x + 1), 15000);
    return () => clearInterval(t);
  }, [active]);

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between', marginBottom: 12 }}>
        <View>
          <Text style={s.hello}>Hey {state.repName || 'there'} 👋</Text>
          <Muted>Your hours. Your hustle. Your money.</Muted>
        </View>
        <Pill label={active ? '● Knocking' : 'Offline'} color={active ? colors.primary : colors.muted} />
      </Row>

      <View style={s.hero}>
        <Pressable onPress={() => !active && router.push('/neighborhoods')}>
          <Text style={s.heroLabel}>NEIGHBORHOOD</Text>
          <Text style={s.heroHood}>{hood ? hood.name : 'Pick a neighborhood'} {!active ? '›' : ''}</Text>
          {hood ? (
            <Text style={s.heroSub}>
              {hood.homes} homes · {'🔥'.repeat(hood.demand)} business demand
            </Text>
          ) : (
            <Text style={s.heroSub}>Choose where you want to knock today</Text>
          )}
        </Pressable>

        {active ? (
          <>
            <Row style={{ marginTop: 18 }}>
              <Stat dark label="On the clock" value={elapsed(Date.now() - active.startedAt)} />
              <Stat dark label="Doors this session" value={String(active.doorsKnocked)} />
            </Row>
            <Row style={{ marginTop: 16 }}>
              <Button label="+1 Door" kind="ghost" textColor="#fff" style={s.ghostOnDark} onPress={() => dispatch({ type: 'knock' })} />
              <Button label="They said yes!" kind="accent" style={{ flex: 1 }} onPress={() => router.push('/new-lead')} />
            </Row>
            <Pressable onPress={() => dispatch({ type: 'endShift' })} style={{ marginTop: 14, alignItems: 'center' }}>
              <Text style={{ color: '#CFE3D8', fontWeight: '700' }}>End session</Text>
            </Pressable>
          </>
        ) : (
          <Button
            label="Start knocking"
            kind="accent"
            style={{ marginTop: 18 }}
            onPress={() => (hood ? dispatch({ type: 'startShift', neighborhoodId: hood.id }) : router.push('/neighborhoods'))}
          />
        )}
      </View>

      <Row style={{ marginTop: 16 }}>
        <Card style={{ flex: 1 }}>
          <Stat label="Earned" value={money(stats.earned)} />
        </Card>
        <Card style={{ flex: 1 }}>
          <Stat label="Per hour" value={money(Math.round(stats.perHour))} />
        </Card>
        <Card style={{ flex: 1 }}>
          <Stat label="Closes" value={String(stats.closes)} />
        </Card>
      </Row>

      <Card style={{ backgroundColor: '#EEF9D2', borderColor: '#DDEFA8' }}>
        <Text style={{ fontWeight: '800', color: colors.primaryDark }}>How you get paid</Text>
        <Muted style={{ marginTop: 4, color: colors.primaryDark }}>
          Doorden pays you a 12% bonus on every job a business accepts. It's funded by our partners, so the homeowner and
          the business never pay it. Close one $150 driveway an hour and that's about $18/hr, with no gas and no car.
          Earnings depend on your closes and are not guaranteed.
        </Muted>
      </Card>

      {recent.length > 0 ? (
        <Section title="Recent leads" right={<Text style={s.link} onPress={() => router.push('/(rep)/leads')}>See all</Text>}>
          {recent.map((l) => {
            const b = state.businesses.find((x) => x.id === l.businessId);
            return (
              <Card key={l.id}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Text style={{ fontWeight: '700', flex: 1 }}>{l.homeowner.name}</Text>
                  <Text style={{ fontWeight: '800', color: colors.primary }}>+{money(l.commission)}</Text>
                </Row>
                <Muted style={{ marginVertical: 4 }}>{b?.name} · {money(l.total)}</Muted>
                <StatusPill status={l.status} />
              </Card>
            );
          })}
        </Section>
      ) : null}

      <Section title="Door scripts that close">
        {pitches.map((p) => (
          <Card key={p.title}>
            <Text style={{ fontWeight: '700', marginBottom: 4 }}>{p.title}</Text>
            <Muted>{p.body}</Muted>
          </Card>
        ))}
      </Section>
    </Screen>
  );
}

const s = StyleSheet.create({
  hello: { fontSize: 24, fontWeight: '800', color: colors.text },
  hero: { backgroundColor: colors.primaryDark, borderRadius: radius.lg, padding: 20 },
  heroLabel: { color: colors.accent, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  heroHood: { color: '#fff', fontSize: 26, fontWeight: '900', marginTop: 4 },
  heroSub: { color: '#CFE3D8', marginTop: 4 },
  ghostOnDark: { borderColor: '#fff', paddingHorizontal: 16 },
  link: { color: colors.primary, fontWeight: '700' },
});
