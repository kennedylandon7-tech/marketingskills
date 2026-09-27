export type Role = 'rep' | 'business' | 'homeowner';

export type PriceUnit = 'flat' | 'per_window' | 'per_sqft';

export interface Service {
  id: string;
  name: string;
  unit: PriceUnit;
  /** Business price guideline: the rep must quote between min and max (per unit). */
  minPrice: number;
  maxPrice: number;
  description: string;
}

export interface Business {
  id: string;
  name: string;
  category: string;
  emoji: string;
  rating: number;
  neighborhoodIds: string[];
  services: Service[];
}

export interface Neighborhood {
  id: string;
  name: string;
  city: string;
  homes: number;
  /** 1-3, how much local businesses want work here right now. */
  demand: 1 | 2 | 3;
}

export type LeadStatus =
  | 'awaiting_homeowner'
  | 'verified'
  | 'accepted'
  | 'completed'
  | 'declined';

export interface Lead {
  id: string;
  code: string;
  businessId: string;
  serviceId: string;
  neighborhoodId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  commission: number;
  homeowner: { name: string; phone: string; address: string };
  notes: string;
  status: LeadStatus;
  createdAt: number;
  updatedAt: number;
}

export interface Shift {
  id: string;
  neighborhoodId: string;
  startedAt: number;
  endedAt?: number;
  doorsKnocked: number;
}

export interface Payout {
  id: string;
  amount: number;
  createdAt: number;
}

export interface AppState {
  role: Role | null;
  repName: string;
  businessId: string;
  selectedNeighborhoodId: string | null;
  businesses: Business[];
  neighborhoods: Neighborhood[];
  leads: Lead[];
  shifts: Shift[];
  payouts: Payout[];
}
