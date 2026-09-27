import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Muted, Row, Screen, Section, Stat, Title } from '../../components/ui';
import { money, repStats, useStore } from '../../lib/store';
import { colors, radius } from '../../lib/theme';

export default function Earnings() {
  const { state, dispatch } = useStore();
  const st = repStats(state);
  const earnedLeads = state.leads.filter((l) => l.status === 'accepted' || l.status === 'completed');

  const cashOut = () => {
    if (st.balance <= 0) return;
    Alert.alert('Cash out', `Send ${money(st.balance)} to your bank?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Cash out', onPress: () => dispatch({ type: 'cashOut', amount: st.balance }) },
    ]);
  };

  return (
    <Screen>
      <Title sub="12% commission on every job a business accepts.">Earnings</Title>

      <View style={s.balance}>
        <Text style={s.balanceLabel}>AVAILABLE BALANCE</Text>
        <Text style={s.balanceValue}>{money(st.balance)}</Text>
        <Button label="Cash out" kind="accent" disabled={st.balance <= 0} onPress={cashOut} style={{ marginTop: 14 }} />
      </View>

      <Row style={{ marginTop: 12 }}>
        <Card style={{ flex: 1 }}><Stat label="Lifetime earned" value={money(st.earned)} /></Card>
        <Card style={{ flex: 1 }}><Stat label="Pending" value={money(st.pending)} /></Card>
      </Row>
      <Row>
        <Card style={{ flex: 1 }}><Stat label="Hours knocked" value={st.hours.toFixed(1)} /></Card>
        <Card style={{ flex: 1 }}><Stat label="Avg per hour" value={money(Math.round(st.perHour))} /></Card>
      </Row>
      <Muted style={{ fontSize: 12 }}>
        Pending = leads waiting on homeowner verification or business acceptance. It moves to your balance when a business accepts.
      </Muted>

      <Section title="Paid jobs">
        {earnedLeads.length === 0 ? (
          <Muted>No accepted jobs yet. Keep knocking!</Muted>
        ) : (
          earnedLeads.map((l) => (
            <Card key={l.id}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: '700' }}>{l.homeowner.name}</Text>
                <Text style={{ fontWeight: '800', color: colors.primary }}>+{money(l.commission)}</Text>
              </Row>
              <Muted>12% of {money(l.total)}</Muted>
            </Card>
          ))
        )}
      </Section>

      {state.payouts.length > 0 ? (
        <Section title="Cash-outs">
          {[...state.payouts].reverse().map((p) => (
            <Card key={p.id}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Text>{new Date(p.createdAt).toLocaleDateString()}</Text>
                <Text style={{ fontWeight: '800' }}>{money(p.amount)}</Text>
              </Row>
            </Card>
          ))}
        </Section>
      ) : null}
    </Screen>
  );
}

const s = StyleSheet.create({
  balance: { backgroundColor: colors.primaryDark, borderRadius: radius.lg, padding: 20 },
  balanceLabel: { color: colors.accent, fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  balanceValue: { color: '#fff', fontSize: 40, fontWeight: '900', marginTop: 4 },
});
