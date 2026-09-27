import type { AppState, Business, Neighborhood } from './types';

// Demo data so the app is fully usable before a backend exists.
export const seedNeighborhoods: Neighborhood[] = [
  { id: 'n1', name: 'Oak Hollow', city: 'Your City', homes: 420, demand: 3 },
  { id: 'n2', name: 'Maple Ridge', city: 'Your City', homes: 310, demand: 2 },
  { id: 'n3', name: 'Cedar Park', city: 'Your City', homes: 560, demand: 3 },
  { id: 'n4', name: 'Lakeside', city: 'Your City', homes: 250, demand: 1 },
  { id: 'n5', name: 'Brookfield', city: 'Your City', homes: 380, demand: 2 },
];

export const seedBusinesses: Business[] = [
  {
    id: 'b1',
    name: 'Blast Off Pressure Washing',
    category: 'Power washing',
    emoji: '💦',
    rating: 4.9,
    neighborhoodIds: ['n1', 'n2', 'n3', 'n5'],
    services: [
      { id: 's1', name: 'Driveway wash', unit: 'flat', minPrice: 120, maxPrice: 200, description: 'Standard 2-car driveway, includes walkway.' },
      { id: 's2', name: 'House wash (soft wash)', unit: 'flat', minPrice: 250, maxPrice: 400, description: 'Siding soft wash, single or two story.' },
      { id: 's3', name: 'Patio / deck wash', unit: 'per_sqft', minPrice: 0.3, maxPrice: 0.5, description: 'Concrete, pavers, or wood deck.' },
    ],
  },
  {
    id: 'b2',
    name: 'Crystal Clear Windows',
    category: 'Window cleaning',
    emoji: '🪟',
    rating: 4.8,
    neighborhoodIds: ['n1', 'n3', 'n4'],
    services: [
      { id: 's4', name: 'Exterior windows', unit: 'per_window', minPrice: 6, maxPrice: 10, description: 'Outside panes, screens wiped.' },
      { id: 's5', name: 'Inside + outside', unit: 'per_window', minPrice: 10, maxPrice: 15, description: 'Full clean, tracks and sills.' },
    ],
  },
  {
    id: 'b3',
    name: 'GutterPros',
    category: 'Gutter cleaning',
    emoji: '🍂',
    rating: 4.7,
    neighborhoodIds: ['n2', 'n4', 'n5'],
    services: [
      { id: 's6', name: 'Gutter clean-out', unit: 'flat', minPrice: 140, maxPrice: 220, description: 'Clear gutters and flush downspouts.' },
    ],
  },
  {
    id: 'b4',
    name: 'Green Blade Lawn Care',
    category: 'Lawn care',
    emoji: '🌱',
    rating: 4.6,
    neighborhoodIds: ['n1', 'n2', 'n3', 'n4', 'n5'],
    services: [
      { id: 's7', name: 'Mow + edge (per visit)', unit: 'flat', minPrice: 40, maxPrice: 65, description: 'Standard lot up to 1/4 acre.' },
      { id: 's8', name: 'Spring cleanup', unit: 'flat', minPrice: 180, maxPrice: 300, description: 'Beds, leaves, trim, haul-away.' },
    ],
  },
];

export const initialState: AppState = {
  role: null,
  repName: '',
  businessId: 'b1',
  selectedNeighborhoodId: null,
  businesses: seedBusinesses,
  neighborhoods: seedNeighborhoods,
  leads: [],
  shifts: [],
  payouts: [],
};
