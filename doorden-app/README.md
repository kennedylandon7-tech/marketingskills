# Doorden

**Get paid to knock. Skills, not miles.**

Doorden works like DoorDash, but for door-to-door sales. Reps pick a neighborhood, knock on doors, and log every "yes." The homeowner confirms the offer in the app, and a local business picks up the job. The rep earns a **12% bonus on every job the business accepts**, paid by Doorden. There's no car, no gas, and no boss.

## How it works

1. **The business** lists its services with a **price guideline** (min to max). Listing is free.
2. **The rep** picks a neighborhood, taps **Start knocking**, and pitches: "Want your driveway power washed for $150?"
3. When someone says yes, the rep taps **They said yes!**, picks the business and service, quotes inside the guideline, and enters the homeowner's info.
4. **The homeowner** gets a text with a 6-character code and a link, then confirms the offer in the app.
5. **The business** sees the verified job and taps **Accept job**. The rep's 12% bonus moves to their balance.
6. The business calls the homeowner, does the work, and marks the job complete.

Example: one $150 driveway closed per hour earns about $18/hr. Earnings depend on closes and are not guaranteed.

## Business model: who pays the 12%

**Not the business, and not the homeowner.** Local businesses get jobs 100% free and keep every dollar. Doorden pays each rep's 12% bonus from **partner revenue**: companies that pay to be the brand behind the bonus and to reach verified homeowners.

| Who | Pays | Gets |
|-----|------|------|
| Homeowner | The business's normal price, after the job | A fair, pre-set price from a trusted local pro |
| Local business | $0 | Free, homeowner-verified jobs |
| Rep | $0 | 12% bonus per accepted job, their own hours |
| **Partner** | Sponsorship (funds the bonuses + Doorden's margin) | Brand on every offer and payout, and opt-in homeowner reach |

The partner shown in the app lives in `BONUS_PARTNER` in `src/lib/theme.ts`. See [`docs/PARTNER_PITCH.md`](docs/PARTNER_PITCH.md) for the pitch.

**Math to watch:** every accepted job costs Doorden 12% of the job price (a $160 driveway = $19.20). Sign partner deals that cover that before scaling reps. A per-verified-job sponsorship fee that is higher than the average bonus keeps each job profitable.

## What's in the app

| Role | Screens |
|------|---------|
| **Rep** | Knock (neighborhood, session timer, door counter, door scripts), Businesses (price guidelines), Leads, Earnings (balance, cash out, $/hr), Skills (levels in Hustle, Closing, Trust, Pitch) |
| **Business** | Jobs inbox (accept or pass on verified jobs, call homeowner, mark complete), Pricing (edit the price guideline), Account |
| **Homeowner** | Verify offer with a code or a `doorden://verify?code=XXXXXX` link |

## Tech

- **Expo SDK 57 / React Native / TypeScript**, one codebase for iPhone (and Android later)
- **Expo Router** for navigation (`src/app/`)
- **Local demo data** in `src/lib/store.tsx`. Everything saves on the device, so the whole flow works today with no server.

```
src/
├── app/                 # Screens (every file is a route)
│   ├── index.tsx        # Welcome + role picker
│   ├── (rep)/           # Rep tabs
│   ├── (business)/      # Business tabs
│   ├── verify.tsx       # Homeowner verification
│   ├── new-lead.tsx     # "Log a yes" form
│   └── neighborhoods.tsx
├── components/          # Shared UI
└── lib/                 # Store, types, seed data, theme
```

## Try it on your iPhone today (free)

1. Install **Node.js 20+** on any computer, then:
   ```bash
   cd doorden-app
   npm install
   npx expo start
   ```
2. Install **Expo Go** from the App Store and scan the QR code.
3. To demo the full loop on one phone: sign up as a rep, log a yes, go to Skills and tap **Switch role**, pick **I got a quote**, enter the code, then switch to **I run a local business** and accept the job.

## Going live: checklist

### 1. Business setup (after you form the LLC)
- [ ] Get your LLC's **EIN** (IRS, free) and a **D-U-N-S number** (free from Dun & Bradstreet; Apple requires it for company accounts, and it can take up to about 2 weeks)
- [ ] Enroll in the **Apple Developer Program as an Organization** ($99/yr) at developer.apple.com
- [ ] Open a business bank account
- [ ] Publish a **Privacy Policy** and **Terms of Service** at a public URL (Apple requires them). Cover rep independent-contractor terms and homeowner data use.

### 2. Backend (needed before real users)
The demo stores everything on one phone. For reps, homeowners, and businesses to use their own phones, add:
- [ ] **Database + auth**, e.g. Supabase or Firebase. Replace the reducer actions in `src/lib/store.tsx` with API calls; each action already maps to one call.
- [ ] **Payouts**: **Stripe Connect** (Express accounts) to charge businesses and pay reps. Stripe also handles 1099-NEC tax forms for reps. Because these are real-world services, Apple lets you use Stripe instead of in-app purchase.
- [ ] **SMS verification**, e.g. Twilio, to text the homeowner their code instead of using the share sheet
- [ ] **Push notifications** (`expo-notifications`) for "new verified job" and "you got paid"
- [ ] **ID check** for reps before they can knock (safety and trust)

### 3. Build and submit (no Mac needed)
```bash
npm install -g eas-cli
eas login                       # free Expo account
eas build --platform ios --profile production
eas submit --platform ios       # uploads to App Store Connect
```
Then in **App Store Connect**: add screenshots (6.9" and 6.5" iPhone), description, keywords, support URL, privacy policy URL, and privacy "nutrition labels." Also give App Review a **demo login** for each role.

Before submitting, change `ios.bundleIdentifier` in `app.json` (`com.doorden.app`) to a reverse domain you own, and replace `assets/icon.png` and `assets/splash-icon.png` with Doorden branding.

### 4. Legal notes to review with a lawyer
- **Solicitation permits**: many cities and HOAs require a door-to-door permit (sometimes called a "Green River ordinance"). Consider showing permit rules per neighborhood in the app.
- **Earnings claims**: keep "upwards of $17/hr" paired with "depends on your closes, not guaranteed" (FTC guidance).
- **Contractor status**: reps set their own hours and aren't employees. Put that in the Terms.
- **Consent**: the "homeowner agreed to be contacted" toggle supports TCPA consent for texts and calls. Keep a record server-side.
