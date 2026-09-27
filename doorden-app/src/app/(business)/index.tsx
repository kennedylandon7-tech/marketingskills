import { Alert, Linking, Text } from 'react-native';

import { Button, Card, Empty, Muted, Row, Screen, Section, Stat, StatusPill, Title } from '../../components/ui';
import { money, useStore } from '../../lib/store';
import { colors } from '../../lib/theme';
import type { Lead } from '../../lib/types';

export default function BusinessJobs() {
  const { state, dispatch } = useStore();
  const business = state.businesses.find((b) => b.id === state.businessId) ?? state.businesses[0];
  const leads = state.leads.filter((l) => l.businessId === business.id);
  const ready = leads.filter((l) => l.status === 'verified');
  const active = leads.filter((l) => l.status === 'accepted');
  const incoming = leads.filter((l) => l.status === 'awaiting_homeowner');
  const done = leads.filter((l) => l.status === 'completed');
  const booked = [...active, ...done].reduce((s, l) => s + l.total, 0);

  const accept = (l: Lead) =>
    Alert.alert(
      'Accept this job?',
      `${money(l.total)} job, free to you. You keep the full ${money(l.total)}. Doorden pays the rep's ${money(l.commission)} bonus.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Accept job', onPress: () => dispatch({ type: 'setLeadStatus', leadId: l.id, status: 'accepted' }) },
      ],
    );

  const JobCard = ({ l, children }: { l: Lead; children?: React.ReactNode }) => {
    const svc = business.services.find((s) => s.id === l.serviceId);
    const hood = state.neighborhoods.find((n) => n.id === l.neighborhoodId);
    return (
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text style={{ fontWeight: '800', fontSize: 16, flex: 1 }}>{svc?.name}</Text>
          <Text style={{ fontWeight: '900', fontSize: 18 }}>{money(l.total)}</Text>
        </Row>
        <Muted style={{ marginTop: 4 }}>
          {l.homeowner.name} · {l.homeowner.address}
          {hood ? ` · ${hood.name}` : ''}
        </Muted>
        {l.notes ? <Muted style={{ marginTop: 4, fontStyle: 'italic' }}>"{l.notes}"</Muted> : null}
        <Row style={{ marginTop: 8, justifyContent: 'space-between' }}>
          <StatusPill status={l.status} />
          {l.status === 'accepted' ? (
            <Text style={{ color: colors.primary, fontWeight: '700' }} onPress={() => Linking.openURL(`tel:${l.homeowner.phone}`)}>
              Call {l.homeowner.phone}
            </Text>
          ) : null}
        </Row>
        {children}
      </Card>
    );
  };

  return (
    <Screen>
      <Title sub={`${business.emoji} ${business.name}`}>Jobs from Doorden</Title>
      <Row>
        <Card style={{ flex: 1 }}><Stat label="Ready to accept" value={String(ready.length)} /></Card>
        <Card style={{ flex: 1 }}><Stat label="Booked revenue" value={money(booked)} /></Card>
      </Row>
      <Muted style={{ fontSize: 12 }}>Doorden jobs are 100% free. Reps earn a 12% bonus paid by Doorden and our partners, so you keep every dollar.</Muted>

      <Section title="Homeowner verified">
        {ready.length === 0 ? (
          <Empty emoji="📭" title="Nothing new yet" body="Verified jobs show up here the moment a homeowner confirms." />
        ) : (
          ready.map((l) => (
            <JobCard key={l.id} l={l}>
              <Muted style={{ marginTop: 8 }}>Rep bonus: {money(l.commission)}, paid by Doorden, not you</Muted>
              <Row style={{ marginTop: 10 }}>
                <Button label="Pass" kind="ghost" style={{ flex: 1 }} onPress={() => dispatch({ type: 'setLeadStatus', leadId: l.id, status: 'declined' })} />
                <Button label="Accept job" style={{ flex: 2 }} onPress={() => accept(l)} />
              </Row>
            </JobCard>
          ))
        )}
      </Section>

      {active.length > 0 ? (
        <Section title="Scheduled / in progress">
          {active.map((l) => (
            <JobCard key={l.id} l={l}>
              <Button label="Mark job complete" kind="ghost" style={{ marginTop: 10, paddingVertical: 10 }} onPress={() => dispatch({ type: 'setLeadStatus', leadId: l.id, status: 'completed' })} />
            </JobCard>
          ))}
        </Section>
      ) : null}

      {incoming.length > 0 ? (
        <Section title="Coming soon (waiting on homeowner)">
          {incoming.map((l) => <JobCard key={l.id} l={l} />)}
        </Section>
      ) : null}

      {done.length > 0 ? (
        <Section title="Completed">
          {done.map((l) => <JobCard key={l.id} l={l} />)}
        </Section>
      ) : null}
    </Screen>
  );
}
