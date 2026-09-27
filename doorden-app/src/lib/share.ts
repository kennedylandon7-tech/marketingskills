import * as Linking from 'expo-linking';

import { money } from './store';
import type { Business, Lead, Service } from './types';

export function verifyLink(code: string) {
  return Linking.createURL('/verify', { queryParams: { code } });
}

export function shareOffer(lead: Lead, business: Business, service: Service) {
  const first = lead.homeowner.name.split(' ')[0];
  return (
    `Hi ${first}! Here's your ${service.name.toLowerCase()} quote from ${business.name}: ${money(lead.total)}.\n\n` +
    `Confirm it in the Doorden app with code ${lead.code}, then ${business.name} will reach out to schedule. ` +
    `No payment until the job is done.\n${verifyLink(lead.code)}`
  );
}
