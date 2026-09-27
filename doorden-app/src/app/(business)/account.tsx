import { router } from 'expo-router';
import { Text } from 'react-native';

import { Button, Card, Muted, Row, Screen, Section, Title } from '../../components/ui';
import { useStore } from '../../lib/store';
import { colors } from '../../lib/theme';

export default function Account() {
  const { state, dispatch } = useStore();

  return (
    <Screen>
      <Title sub="Demo mode: pick which business you're signed in as.">Account</Title>
      {state.businesses.map((b) => (
        <Card
          key={b.id}
          style={b.id === state.businessId ? { borderColor: colors.primary, borderWidth: 2 } : undefined}
          onPress={() => dispatch({ type: 'setBusiness', businessId: b.id })}
        >
          <Row>
            <Text style={{ fontSize: 28 }}>{b.emoji}</Text>
            <Text style={{ fontWeight: '800', flex: 1 }}>{b.name}</Text>
            {b.id === state.businessId ? <Text style={{ color: colors.primary, fontWeight: '800' }}>✓</Text> : null}
          </Row>
        </Card>
      ))}

      <Section title="How Doorden works for you">
        <Card>
          <Muted>
            1. Set your price guideline.{'\n'}2. Reps knock doors and quote inside it.{'\n'}3. Homeowners confirm the offer in the app.
            {'\n'}4. You accept the job and do the work. No ads, no monthly fee.
          </Muted>
        </Card>
      </Section>

      <Button
        label="Switch role"
        kind="ghost"
        style={{ marginTop: 16 }}
        onPress={() => {
          dispatch({ type: 'setRole', role: null });
          router.replace('/');
        }}
      />
    </Screen>
  );
}
