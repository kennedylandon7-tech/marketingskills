import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Pressable, ScrollView, Share, Switch, Text, TextInput, View } from 'react-native';

import { Button, Card, Muted, Row, styles as ui } from '../components/ui';
import { shareOffer } from '../lib/share';
import { commissionFor, makeVerifyCode, money, unitLabel, useStore } from '../lib/store';
import { colors, radius } from '../lib/theme';
import type { Lead } from '../lib/types';

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: radius.pill,
        borderWidth: 1.5,
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: selected ? colors.primary : '#fff',
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      <Text style={{ color: selected ? '#fff' : colors.text, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}

export default function NewLead() {
  const params = useLocalSearchParams<{ businessId?: string }>();
  const { state, dispatch } = useStore();
  const hoodId = state.shifts.find((s) => !s.endedAt)?.neighborhoodId ?? state.selectedNeighborhoodId ?? state.neighborhoods[0].id;

  const businesses = useMemo(
    () => [...state.businesses].sort((a, b) => Number(b.neighborhoodIds.includes(hoodId)) - Number(a.neighborhoodIds.includes(hoodId))),
    [state.businesses, hoodId],
  );

  const [businessId, setBusinessId] = useState(params.businessId ?? businesses[0].id);
  const business = state.businesses.find((b) => b.id === businessId)!;
  const [serviceId, setServiceId] = useState(business.services[0].id);
  const service = business.services.find((s) => s.id === serviceId) ?? business.services[0];

  const [qty, setQty] = useState('1');
  const [price, setPrice] = useState(String(Math.round((service.minPrice + service.maxPrice) / 2)));
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [consent, setConsent] = useState(false);

  const pickBusiness = (id: string) => {
    const b = state.businesses.find((x) => x.id === id)!;
    setBusinessId(id);
    pickService(b.services[0].id, b.services[0].minPrice, b.services[0].maxPrice);
  };
  const pickService = (id: string, min: number, max: number) => {
    setServiceId(id);
    const mid = (min + max) / 2;
    setPrice(String(mid < 5 ? mid.toFixed(2) : Math.round(mid)));
    setQty('1');
  };

  const unitPrice = Number(price) || 0;
  const quantity = service.unit === 'flat' ? 1 : Math.max(0, Number(qty) || 0);
  const total = Math.round(unitPrice * quantity * 100) / 100;
  const inRange = unitPrice >= service.minPrice && unitPrice <= service.maxPrice;
  const valid = inRange && quantity > 0 && name.trim() && phone.trim() && address.trim() && consent;

  const submit = async () => {
    if (!valid) return;
    const now = Date.now();
    const lead: Lead = {
      id: Math.random().toString(36).slice(2, 10),
      code: makeVerifyCode(),
      businessId,
      serviceId: service.id,
      neighborhoodId: hoodId,
      quantity,
      unitPrice,
      total,
      commission: commissionFor(total),
      homeowner: { name: name.trim(), phone: phone.trim(), address: address.trim() },
      notes: notes.trim(),
      status: 'awaiting_homeowner',
      createdAt: now,
      updatedAt: now,
    };
    dispatch({ type: 'createLead', lead });
    router.back();
    Alert.alert(
      'Yes logged! 🎉',
      `Have ${lead.homeowner.name.split(' ')[0]} verify with code ${lead.code}. Send it now?`,
      [
        { text: 'Later', style: 'cancel' },
        { text: 'Send offer', onPress: () => Share.share({ message: shareOffer(lead, business, service) }) },
      ],
    );
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
        <Text style={ui.label}>Business</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {businesses.map((b) => (
            <Chip key={b.id} label={`${b.emoji} ${b.name}`} selected={b.id === businessId} onPress={() => pickBusiness(b.id)} />
          ))}
        </View>

        <Text style={[ui.label, { marginTop: 10 }]}>Service</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {business.services.map((s) => (
            <Chip key={s.id} label={s.name} selected={s.id === service.id} onPress={() => pickService(s.id, s.minPrice, s.maxPrice)} />
          ))}
        </View>

        <Card style={{ marginTop: 6 }}>
          <Muted>
            Guideline: {money(service.minPrice)}–{money(service.maxPrice)} {unitLabel(service.unit)}
          </Muted>
          <Row style={{ marginTop: 10 }}>
            {service.unit !== 'flat' ? (
              <View style={{ flex: 1 }}>
                <Text style={ui.label}>{service.unit === 'per_window' ? 'Windows' : 'Sq ft'}</Text>
                <TextInput style={ui.input} keyboardType="number-pad" value={qty} onChangeText={setQty} />
              </View>
            ) : null}
            <View style={{ flex: 1 }}>
              <Text style={ui.label}>Price {unitLabel(service.unit)}</Text>
              <TextInput
                style={[ui.input, !inRange && { borderColor: colors.danger }]}
                keyboardType="decimal-pad"
                value={price}
                onChangeText={setPrice}
              />
            </View>
          </Row>
          {!inRange ? <Text style={{ color: colors.danger, marginBottom: 6 }}>Price must be inside the business guideline.</Text> : null}
          <Row style={{ justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 16, fontWeight: '700' }}>Quote: {money(total)}</Text>
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.primary }}>You earn {money(commissionFor(total))}</Text>
          </Row>
        </Card>

        <Text style={[ui.label, { marginTop: 10 }]}>Homeowner</Text>
        <TextInput style={ui.input} placeholder="Full name" placeholderTextColor={colors.muted} value={name} onChangeText={setName} />
        <TextInput style={ui.input} placeholder="Mobile number" placeholderTextColor={colors.muted} keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
        <TextInput style={ui.input} placeholder="Street address" placeholderTextColor={colors.muted} value={address} onChangeText={setAddress} />
        <TextInput
          style={[ui.input, { minHeight: 70 }]}
          multiline
          placeholder="Notes for the business (best time, gate code, dog...)"
          placeholderTextColor={colors.muted}
          value={notes}
          onChangeText={setNotes}
        />

        <Row style={{ marginVertical: 8 }}>
          <Switch value={consent} onValueChange={setConsent} trackColor={{ true: colors.primary }} />
          <Muted style={{ flex: 1 }}>The homeowner said yes and agreed to be contacted by {business.name} about this quote.</Muted>
        </Row>

        <Button label="Log it & send to homeowner" disabled={!valid} onPress={submit} style={{ marginTop: 8 }} />
        <Muted style={{ textAlign: 'center', marginTop: 10, fontSize: 12 }}>
          The homeowner confirms the price in Doorden. Then the business picks it up.
        </Muted>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
