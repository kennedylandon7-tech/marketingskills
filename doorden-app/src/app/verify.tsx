import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput } from 'react-native';

import { Button, Card, Muted, Row, Screen, StatusPill, Title, styles as ui } from '../components/ui';
import { money, unitLabel, useStore } from '../lib/store';
import { BONUS_PARTNER, colors } from '../lib/theme';

export default function Verify() {
  const params = useLocalSearchParams<{ code?: string }>();
  const { state, dispatch } = useStore();
  const [code, setCode] = useState((params.code ?? '').toUpperCase());

  const lead = code.length === 6 ? state.leads.find((l) => l.code === code) : undefined;
  const business = lead && state.businesses.find((b) => b.id === lead.businessId);
  const service = business?.services.find((s) => s.id === lead?.serviceId);

  return (
    <Screen>
      <Title sub="Enter the 6-character code your Doorden rep sent you.">Confirm your quote</Title>
      <TextInput
        style={[ui.input, { fontSize: 24, letterSpacing: 6, textAlign: 'center', fontWeight: '800' }]}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={6}
        placeholder="ABC123"
        placeholderTextColor={colors.border}
        value={code}
        onChangeText={(t) => setCode(t.toUpperCase())}
      />

      {code.length === 6 && !lead ? <Muted>No offer found for that code. Double-check it with your rep.</Muted> : null}

      {lead && business && service ? (
        <Card style={{ marginTop: 8 }}>
          <Row>
            <Text style={{ fontSize: 34 }}>{business.emoji}</Text>
            <Text style={{ fontWeight: '800', fontSize: 17, flex: 1 }}>{business.name}</Text>
          </Row>
          <Text style={{ fontSize: 16, fontWeight: '700', marginTop: 12 }}>{service.name}</Text>
          <Muted>{service.description}</Muted>
          {service.unit !== 'flat' ? (
            <Muted style={{ marginTop: 4 }}>
              {lead.quantity} × {money(lead.unitPrice)} {unitLabel(service.unit)}
            </Muted>
          ) : null}
          <Text style={{ fontSize: 34, fontWeight: '900', marginTop: 10, color: colors.primaryDark }}>{money(lead.total)}</Text>
          <Muted style={{ marginBottom: 12 }}>For {lead.homeowner.name} · {lead.homeowner.address}</Muted>

          {lead.status === 'awaiting_homeowner' ? (
            <>
              <Button label="Yes, confirm this offer" onPress={() => dispatch({ type: 'setLeadStatus', leadId: lead.id, status: 'verified' })} />
              <Button
                label="No thanks"
                kind="ghost"
                style={{ marginTop: 8 }}
                onPress={() => dispatch({ type: 'setLeadStatus', leadId: lead.id, status: 'declined' })}
              />
              <Muted style={{ fontSize: 12, marginTop: 10, textAlign: 'center' }}>
                Nothing is charged now. You pay the business directly after the job is done.
              </Muted>
              <Muted style={{ fontSize: 12, marginTop: 6, textAlign: 'center' }}>
                {BONUS_PARTNER.tagline} · {BONUS_PARTNER.name}
              </Muted>
            </>
          ) : (
            <>
              <StatusPill status={lead.status} />
              {lead.status !== 'declined' ? (
                <Muted style={{ marginTop: 8 }}>You're all set. {business.name} will contact you to schedule.</Muted>
              ) : null}
            </>
          )}
        </Card>
      ) : null}

      {state.role === 'homeowner' ? (
        <Button
          label="Switch role"
          kind="ghost"
          style={{ marginTop: 24 }}
          onPress={() => {
            dispatch({ type: 'setRole', role: null });
            router.replace('/');
          }}
        />
      ) : null}
    </Screen>
  );
}
