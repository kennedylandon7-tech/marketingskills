import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react';

import { initialState } from './seed';
import { COMMISSION_RATE } from './theme';
import type { AppState, Lead, Role, Service } from './types';

// Local, on-device store. Every action here maps 1:1 to a future API call
// (see README "Going live"), so swapping in a real backend is contained to this file.

const STORAGE_KEY = 'doorden:v1';

type Action =
  | { type: 'hydrate'; state: AppState }
  | { type: 'setRole'; role: Role | null }
  | { type: 'setRepName'; name: string }
  | { type: 'setBusiness'; businessId: string }
  | { type: 'selectNeighborhood'; neighborhoodId: string }
  | { type: 'startShift'; neighborhoodId: string }
  | { type: 'knock' }
  | { type: 'endShift' }
  | { type: 'createLead'; lead: Lead }
  | { type: 'setLeadStatus'; leadId: string; status: Lead['status'] }
  | { type: 'updateService'; businessId: string; service: Service }
  | { type: 'cashOut'; amount: number }
  | { type: 'reset' };

const id = () => Math.random().toString(36).slice(2, 10);

export function makeVerifyCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function reducer(state: AppState, action: Action): AppState {
  const now = Date.now();
  switch (action.type) {
    case 'hydrate':
      return action.state;
    case 'setRole':
      return { ...state, role: action.role };
    case 'setRepName':
      return { ...state, repName: action.name };
    case 'setBusiness':
      return { ...state, businessId: action.businessId };
    case 'selectNeighborhood':
      return { ...state, selectedNeighborhoodId: action.neighborhoodId };
    case 'startShift':
      if (state.shifts.some((s) => !s.endedAt)) return state;
      return {
        ...state,
        selectedNeighborhoodId: action.neighborhoodId,
        shifts: [...state.shifts, { id: id(), neighborhoodId: action.neighborhoodId, startedAt: now, doorsKnocked: 0 }],
      };
    case 'knock':
      return {
        ...state,
        shifts: state.shifts.map((s) => (s.endedAt ? s : { ...s, doorsKnocked: s.doorsKnocked + 1 })),
      };
    case 'endShift':
      return { ...state, shifts: state.shifts.map((s) => (s.endedAt ? s : { ...s, endedAt: now })) };
    case 'createLead':
      return { ...state, leads: [action.lead, ...state.leads] };
    case 'setLeadStatus':
      return {
        ...state,
        leads: state.leads.map((l) => (l.id === action.leadId ? { ...l, status: action.status, updatedAt: now } : l)),
      };
    case 'updateService':
      return {
        ...state,
        businesses: state.businesses.map((b) =>
          b.id !== action.businessId
            ? b
            : { ...b, services: b.services.map((s) => (s.id === action.service.id ? action.service : s)) },
        ),
      };
    case 'cashOut':
      return { ...state, payouts: [...state.payouts, { id: id(), amount: action.amount, createdAt: now }] };
    case 'reset':
      return initialState;
  }
}

interface Store {
  state: AppState;
  ready: boolean;
  dispatch: React.Dispatch<Action>;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) dispatch({ type: 'hydrate', state: { ...initialState, ...JSON.parse(raw) } });
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  const value = useMemo(() => ({ state, dispatch, ready }), [state, ready]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

// ---- Derived values ----

export const commissionFor = (total: number) => Math.round(total * COMMISSION_RATE * 100) / 100;

export const isEarned = (l: Lead) => l.status === 'accepted' || l.status === 'completed';

export function repStats(state: AppState) {
  const earned = state.leads.filter(isEarned).reduce((sum, l) => sum + l.commission, 0);
  const paidOut = state.payouts.reduce((sum, p) => sum + p.amount, 0);
  const pending = state.leads
    .filter((l) => l.status === 'awaiting_homeowner' || l.status === 'verified')
    .reduce((sum, l) => sum + l.commission, 0);
  const hours = state.shifts.reduce((sum, s) => sum + ((s.endedAt ?? Date.now()) - s.startedAt) / 3_600_000, 0);
  const doors = state.shifts.reduce((sum, s) => sum + s.doorsKnocked, 0);
  const closes = state.leads.filter((l) => l.status !== 'declined').length;
  const verified = state.leads.filter((l) => l.status !== 'awaiting_homeowner' && l.status !== 'declined').length;
  return {
    earned,
    paidOut,
    balance: Math.max(0, Math.round((earned - paidOut) * 100) / 100),
    pending,
    hours,
    doors,
    closes,
    verified,
    perHour: hours > 0.05 ? earned / hours : 0,
    closeRate: doors > 0 ? closes / doors : 0,
  };
}

export const money = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

export const unitLabel = (u: Service['unit']) =>
  u === 'flat' ? 'per job' : u === 'per_window' ? 'per window' : 'per sq ft';
