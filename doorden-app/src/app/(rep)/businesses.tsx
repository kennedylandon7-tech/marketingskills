import { router } from 'expo-router';
import { Text } from 'react-native';

import { Card, Muted, Pill, Row, Screen, Title } from '../../components/ui';
import { money, unitLabel, useStore } from '../../lib/store';
import { colors } from '../../lib/theme';

export default function Businesses() {
  const { state } = useStore();
  const hoodId = state.selectedNeighborhoodId;
  const hood = state.neighborhoods.find((n) => n.id === hoodId);
  const list = [...state.businesses].sort(
    (a, b) => Number(!!hoodId && b.neighborhoodIds.includes(hoodId)) - Number(!!hoodId && a.neighborhoodIds.includes(hoodId)),
  );

  return (
    <Screen>
      <Title sub={hood ? `Businesses taking jobs in ${hood.name} are listed first.` : 'Pick who you want to sell for.'}>
        Sell for local pros
      </Title>
      {list.map((b) => {
        const servesHere = !!hoodId && b.neighborhoodIds.includes(hoodId);
        const top = b.services[0];
        return (
          <Card key={b.id} onPress={() => router.push({ pathname: '/business/[id]', params: { id: b.id } })}>
            <Row>
              <Text style={{ fontSize: 34 }}>{b.emoji}</Text>
              <Text style={{ flex: 1, fontSize: 17, fontWeight: '800', color: colors.text }}>{b.name}</Text>
              <Text style={{ fontWeight: '700' }}>★ {b.rating}</Text>
            </Row>
            <Muted style={{ marginTop: 6 }}>
              {b.category} · {b.services.length} services · from {money(top.minPrice)} {unitLabel(top.unit)}
            </Muted>
            <Row style={{ marginTop: 8 }}>
              {servesHere ? <Pill label="Serves your neighborhood" /> : <Pill label="Other areas" color={colors.muted} />}
              <Pill label="12% to you" color={colors.primaryDark} bg={colors.accent} />
            </Row>
          </Card>
        );
      })}
    </Screen>
  );
}
