import { router, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

import { Button, Card, Muted, Row, Screen, Section, Title } from '../../components/ui';
import { commissionFor, money, unitLabel, useStore } from '../../lib/store';
import { colors } from '../../lib/theme';

export default function BusinessDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state } = useStore();
  const b = state.businesses.find((x) => x.id === id);
  if (!b) return <Screen><Muted>Business not found.</Muted></Screen>;

  const areas = state.neighborhoods.filter((n) => b.neighborhoodIds.includes(n.id)).map((n) => n.name);

  return (
    <Screen>
      <Text style={{ fontSize: 48 }}>{b.emoji}</Text>
      <Title sub={`${b.category} · ★ ${b.rating}`}>{b.name}</Title>
      <Muted>Serves: {areas.join(', ')}</Muted>

      <Section title="Price guideline">
        <Muted style={{ marginBottom: 10 }}>Quote inside these ranges. The business sets them, so every yes you log is a job they'll take.</Muted>
        {b.services.map((s) => (
          <Card key={s.id}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: '800', flex: 1 }}>{s.name}</Text>
              <Text style={{ fontWeight: '800' }}>
                {money(s.minPrice)}–{money(s.maxPrice)}
              </Text>
            </Row>
            <Muted style={{ marginTop: 2 }}>{unitLabel(s.unit)} · {s.description}</Muted>
            {s.unit === 'flat' ? (
              <Text style={{ marginTop: 6, color: colors.primary, fontWeight: '700' }}>
                You earn {money(commissionFor(s.minPrice))}–{money(commissionFor(s.maxPrice))} per close
              </Text>
            ) : null}
          </Card>
        ))}
      </Section>

      <Button
        label="Log a yes for this business"
        style={{ marginTop: 12 }}
        onPress={() => router.push({ pathname: '/new-lead', params: { businessId: b.id } })}
      />
    </Screen>
  );
}
