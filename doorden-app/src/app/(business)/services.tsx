import { useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';

import { Button, Card, Muted, Row, Screen, Title, styles as ui } from '../../components/ui';
import { unitLabel, useStore } from '../../lib/store';
import type { Service } from '../../lib/types';

function ServiceEditor({ service, onSave }: { service: Service; onSave: (s: Service) => void }) {
  const [min, setMin] = useState(String(service.minPrice));
  const [max, setMax] = useState(String(service.maxPrice));
  const dirty = min !== String(service.minPrice) || max !== String(service.maxPrice);

  const save = () => {
    const lo = Number(min);
    const hi = Number(max);
    if (!(lo > 0) || !(hi >= lo)) {
      Alert.alert('Check prices', 'Minimum must be above 0 and no higher than the maximum.');
      return;
    }
    onSave({ ...service, minPrice: lo, maxPrice: hi });
  };

  return (
    <Card>
      <Text style={{ fontWeight: '800', fontSize: 16 }}>{service.name}</Text>
      <Muted style={{ marginBottom: 10 }}>{unitLabel(service.unit)} · {service.description}</Muted>
      <Row>
        <View style={{ flex: 1 }}>
          <Text style={ui.label}>Min $</Text>
          <TextInput style={ui.input} keyboardType="decimal-pad" value={min} onChangeText={setMin} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={ui.label}>Max $</Text>
          <TextInput style={ui.input} keyboardType="decimal-pad" value={max} onChangeText={setMax} />
        </View>
      </Row>
      {dirty ? <Button label="Save guideline" onPress={save} /> : null}
    </Card>
  );
}

export default function Services() {
  const { state, dispatch } = useStore();
  const business = state.businesses.find((b) => b.id === state.businessId) ?? state.businesses[0];

  return (
    <Screen>
      <Title sub="Reps can only quote inside these ranges. Set prices you'll happily accept.">Price guideline</Title>
      {business.services.map((s) => (
        <ServiceEditor key={s.id + s.minPrice + s.maxPrice} service={s} onSave={(service) => dispatch({ type: 'updateService', businessId: business.id, service })} />
      ))}
    </Screen>
  );
}
