import { router } from 'expo-router';
import { Share, Text } from 'react-native';

import { Button, Card, Empty, Muted, Row, Screen, StatusPill, Title } from '../../components/ui';
import { money, useStore } from '../../lib/store';
import { colors } from '../../lib/theme';
import { shareOffer } from '../../lib/share';

export default function Leads() {
  const { state } = useStore();

  return (
    <Screen>
      <Title sub="Every yes you log. Homeowner verifies, business accepts, you get paid.">Your leads</Title>
      <Button label="+ Log a new yes" onPress={() => router.push('/new-lead')} style={{ marginBottom: 16 }} />
      {state.leads.length === 0 ? (
        <Empty emoji="🚪" title="No leads yet" body="Start knocking and log your first yes. It only takes 30 seconds." />
      ) : (
        state.leads.map((l) => {
          const b = state.businesses.find((x) => x.id === l.businessId);
          const svc = b?.services.find((x) => x.id === l.serviceId);
          return (
            <Card key={l.id}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: '800', fontSize: 16, flex: 1 }}>{l.homeowner.name}</Text>
                <Text style={{ fontWeight: '800', color: colors.primary }}>+{money(l.commission)}</Text>
              </Row>
              <Muted style={{ marginTop: 2 }}>{l.homeowner.address}</Muted>
              <Muted style={{ marginVertical: 6 }}>
                {svc?.name} · {b?.name} · {money(l.total)}
              </Muted>
              <Row style={{ justifyContent: 'space-between' }}>
                <StatusPill status={l.status} />
                <Text style={{ fontWeight: '700', letterSpacing: 1 }}>#{l.code}</Text>
              </Row>
              {l.status === 'awaiting_homeowner' && b && svc ? (
                <Button
                  label="Resend offer to homeowner"
                  kind="ghost"
                  style={{ marginTop: 10, paddingVertical: 10 }}
                  onPress={() => Share.share({ message: shareOffer(l, b, svc) })}
                />
              ) : null}
            </Card>
          );
        })
      )}
    </Screen>
  );
}
