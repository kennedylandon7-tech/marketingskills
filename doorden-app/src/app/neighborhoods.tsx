import { router } from 'expo-router';
import { Text } from 'react-native';

import { Card, Muted, Pill, Row, Screen } from '../components/ui';
import { useStore } from '../lib/store';
import { colors } from '../lib/theme';

export default function Neighborhoods() {
  const { state, dispatch } = useStore();
  const sorted = [...state.neighborhoods].sort((a, b) => b.demand - a.demand);

  return (
    <Screen>
      <Muted style={{ marginBottom: 12 }}>Hotter neighborhoods have more local businesses looking for jobs.</Muted>
      {sorted.map((n) => {
        const count = state.businesses.filter((b) => b.neighborhoodIds.includes(n.id)).length;
        const selected = n.id === state.selectedNeighborhoodId;
        return (
          <Card
            key={n.id}
            style={selected ? { borderColor: colors.primary, borderWidth: 2 } : undefined}
            onPress={() => {
              dispatch({ type: 'selectNeighborhood', neighborhoodId: n.id });
              router.back();
            }}
          >
            <Row style={{ justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 18, fontWeight: '800' }}>{n.name}</Text>
              <Text>{'🔥'.repeat(n.demand)}</Text>
            </Row>
            <Muted style={{ marginVertical: 6 }}>
              {n.city} · {n.homes} homes
            </Muted>
            <Pill label={`${count} businesses buying jobs here`} />
          </Card>
        );
      })}
    </Screen>
  );
}
