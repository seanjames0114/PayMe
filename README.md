# PayMe

> Split restaurant bills without the awkward math.

Snap a receipt, share a link — everyone claims what they ordered and pays you directly in one tap. No signup required for friends. Organizers can sign in to track their tabs across devices.

**Stack:** Next.js 16 · TypeScript · Tailwind CSS · Tesseract.js · Supabase · Vercel

---

## Features

| | |
|---|---|
| **Free browser OCR** | Tesseract.js reads your receipt on-device. No API key, no rate limits, no data uploaded. |
| **Real-time table** | Friends join via a shared link and see each other claim items live via Supabase Realtime. |
| **Fair splits** | Multiple people can split a single item. Tax and tip divide proportionally by what you ordered. |
| **One-tap payment** | Deep links open Venmo, Cash App, or PayPal pre-filled with the exact amount owed. |
| **Session history** | Organizers see all their past tabs on the homepage. Signed-in users sync across devices; anonymous users see tabs stored locally. |
| **Auth (optional)** | Sign in with Google or a magic link email. Friends never need to sign in to join a tab. |

---

## How it works

```mermaid
flowchart LR
    A([Sign in\noptional]) --> B([Snap receipt])
    B --> C([OCR extracts items])
    C --> D([Review and edit])
    D --> E([Homepage\ntab listed])
    E --> F([Share link])
    F --> G([Friends join\nand claim])
    G --> H([Everyone pays you])
```

---

## User flow

```mermaid
flowchart TD
    Start([Open PayMe]) --> Home[Homepage]

    Home -->|signed in| History[Your Tables\nrecent tabs visible]
    Home -->|not signed in| AnonHistory[Recent tabs\nfrom localStorage]
    Home --> Create[Click Start a Tab]

    subgraph Wizard ["/create — 4-step wizard"]
        Create --> Upload[Step 1: Upload receipt\ndrag and drop or camera]
        Upload --> OCR[Step 2: Tesseract.js OCR\nruns in browser]
        OCR -->|success| Review[Step 3: Review items\nedit names and prices]
        OCR -->|fail| ManualEntry[Step 3: Enter items\nmanually]
        ManualEntry --> Review
        Review --> PaySetup[Step 4: Your name\npayment handles]
        PaySetup --> Submit[POST /api/sessions]
    end

    Submit --> Redirect[Redirect to /session/id]
    Redirect --> OrgRoom[Session room\nas organizer]
    OrgRoom --> Share[Share link]

    Share --> FriendURL[Friend opens /session/id]
    FriendURL --> JoinModal[Enter name\ncolor assigned]
    JoinModal --> FriendRoom[Session room\nas participant]

    FriendRoom --> Claim[Tap items to claim\nor split with others]
    Claim --> RT[[Supabase Realtime\npushes to all tabs]]
    RT --> AllUpdate[All participants\nsee live updates]

    AllUpdate --> Summary[Bill summary\nexact amount owed]
    Summary -->|organizer| NoPayment[No payment needed\nyou collect]
    Summary -->|participant| PayButton[Tap Pay]
    PayButton --> DeepLink[Venmo / Cash App / PayPal\nopens pre-filled]
```

---

## Google OAuth flow

```mermaid
sequenceDiagram
    actor U as User
    participant App as PayMe\n(Browser)
    participant CB as /auth/callback\n(Vercel)
    participant Conf as /auth/confirm\n(Browser)
    participant SA as Supabase Auth
    participant G as Google

    U->>App: Click "Continue with Google"
    App->>SA: signInWithOAuth({ provider: 'google' })\ngenerates PKCE code_verifier
    SA->>G: Redirect to Google consent screen
    G-->>U: Show consent UI
    U->>G: Approve
    G->>CB: Redirect with ?code=AUTH_CODE
    CB->>Conf: Redirect with ?code=AUTH_CODE\n(server route passes code to client)
    Conf->>SA: exchangeCodeForSession(code)\nuses stored code_verifier
    SA-->>Conf: JWT session
    Conf->>App: Redirect home\nsession stored in browser
    App->>App: AuthProvider detects session\nuser state updates everywhere
```

PKCE ensures the auth code can only be exchanged by the same browser that initiated the login — `/auth/callback` is a server route that cannot hold the verifier, so it immediately hands off to the client-side `/auth/confirm` page.

---

## Bill calculation

```mermaid
flowchart TD
    A[Items claimed by me] --> B[My subtotal\nsum of my item shares]
    
    subgraph Split ["Per item: price ÷ split count"]
        S1[Manual split\nset with +/- buttons] -->|takes priority| SD[effective split count]
        S2[Auto split\nnumber of claimers] -->|fallback| SD
    end

    SD --> B
    B --> C[My fraction\nmy subtotal ÷ total subtotal]
    C --> D[My tax share\ntax × my fraction]
    C --> E[My tip share\ntip × my fraction]
    B --> F[My total\nsubtotal + tax share + tip share]
    D --> F
    E --> F
    F --> G[Shown in Bill Summary\nand pre-filled in payment deeplink]
```

---

## System architecture

```mermaid
graph TB
    subgraph client [Browser]
        direction TB
        UI[React UI\nNext.js App Router]
        OCR[Tesseract.js\nOCR Engine]
        AUTH[AuthProvider\nsupabase.auth]
        LS[(localStorage\nparticipant ID +\nanon session history)]
    end

    subgraph vercel [Vercel — Edge Network]
        SSR[Next.js SSR\nPage rendering]
        API[API Route\nPOST /api/sessions]
    end

    subgraph supabase [Supabase]
        DB[(PostgreSQL\nDatabase)]
        RT[Realtime\nWebSocket]
        RLS[Row Level\nSecurity]
        SAUTH[Supabase Auth\nGoogle OAuth · Magic Link]
    end

    OCR -->|parsed items| UI
    UI -->|navigate| SSR
    UI -->|create session + user_id| API
    API -->|insert rows| DB
    UI <-->|subscribe changes| RT
    RT -->|watches| DB
    RLS -->|enforces policies| DB
    UI -->|store participant id| LS
    AUTH <-->|JWT session| SAUTH
    SAUTH -->|identity| DB
    AUTH -->|user.id| UI
```

---

## Database schema

```mermaid
erDiagram
    auth_users {
        uuid id PK
        text email
    }
    sessions {
        uuid id PK
        uuid user_id FK
        text organizer_name
        jsonb payment_methods
        numeric subtotal
        numeric tax
        numeric tip
        timestamptz created_at
    }
    items {
        uuid id PK
        uuid session_id FK
        text name
        numeric price
        int quantity
    }
    participants {
        uuid id PK
        uuid session_id FK
        text name
        text color
        bool is_organizer
        timestamptz joined_at
    }
    selections {
        uuid id PK
        uuid participant_id FK
        uuid item_id FK
    }

    auth_users ||--o{ sessions     : "owns"
    sessions   ||--o{ items        : "has"
    sessions   ||--o{ participants : "has"
    participants ||--o{ selections : "makes"
    items        ||--o{ selections : "claimed in"
```

---

## Real-time sequence

```mermaid
sequenceDiagram
    actor O as Organizer
    participant A as Supabase Auth
    participant V as Vercel API
    participant DB as Supabase DB
    participant RT as Supabase Realtime
    actor F as Friend

    O->>A: Sign in (Google / magic link) — optional
    A-->>O: JWT session

    O->>V: POST /api/sessions (+ user_id if signed in)
    V->>DB: INSERT session + items
    V-->>O: { sessionId }
    O->>O: Redirected to homepage\ntab appears in "Your Tables"
    O->>O: Shares /session/id link

    F->>DB: INSERT participant (name, color)
    DB-->>RT: change event
    RT-->>O: new seat appears at table
    RT-->>F: table updates live

    F->>DB: INSERT selection (claim item)
    DB-->>RT: change event
    RT-->>O: item marked as claimed
    RT-->>F: all friends see claim

    F->>F: Tap Pay
    F->>F: Venmo / CashApp / PayPal\nopens with pre-filled amount
```

---

## Project structure

```
payme/
├── app/
│   ├── page.tsx                   # Homepage — session history + landing
│   ├── create/
│   │   └── page.tsx               # 4-step wizard (upload → OCR → items → payment)
│   ├── session/
│   │   └── [id]/
│   │       └── page.tsx           # Live session room with realtime
│   ├── auth/
│   │   ├── callback/
│   │   │   └── route.ts           # Receives OAuth/magic-link redirect, forwards to /auth/confirm
│   │   └── confirm/
│   │       └── page.tsx           # Client page — exchanges PKCE code for session, redirects home
│   └── api/
│       └── sessions/
│           └── route.ts           # POST — creates session + items in Supabase
│
├── components/
│   ├── auth/
│   │   ├── AuthProvider.tsx       # React context — user state, sign in/out methods
│   │   ├── AuthModal.tsx          # Sign-in UI (Google OAuth + magic link email)
│   │   └── NavAuth.tsx            # Nav bar sign in/out button
│   ├── landing/
│   │   ├── Hero.tsx
│   │   ├── HowItWorks.tsx
│   │   └── MySessions.tsx         # Session history cards (Supabase or localStorage)
│   ├── create/
│   │   ├── UploadStep.tsx         # Drag & drop / camera capture
│   │   ├── OcrProcessor.tsx       # Tesseract.js progress UI
│   │   ├── ItemsEditor.tsx        # Editable item list + tax/tip
│   │   └── PaymentSetup.tsx       # Name + payment handles
│   ├── session/
│   │   ├── JoinModal.tsx          # Name entry overlay for new participants
│   │   ├── TableView.tsx          # SVG circular table with participant seats
│   │   ├── ItemCard.tsx           # Claimable item with split support
│   │   ├── BillSummary.tsx        # Per-person total + pay button
│   │   └── PaymentModal.tsx       # Deep links to payment apps
│   ├── ClientProviders.tsx        # Client wrapper for layout (AuthProvider)
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Spinner.tsx
│
├── lib/
│   ├── ocr.ts                     # Tesseract.js wrapper with progress callback
│   ├── receiptParser.ts           # OCR text → structured items[] with price parsing
│   ├── supabase.ts                # Supabase browser client (auth + DB)
│   └── utils.ts                   # formatCurrency, buildPaymentUrl, participant colors
│
├── types/
│   └── index.ts                   # Session, Item, Participant, Selection, PaymentMethod
│
├── supabase/
│   └── schema.sql                 # Full DB schema — tables, indexes, RLS, Realtime
│
└── .env.local.example
```

---

## OCR pipeline

```mermaid
flowchart LR
    A[Receipt image\nJPG / PNG / HEIC] --> B[Tesseract.js\nWeb Worker]
    B --> C[Raw text]
    C --> D[receiptParser.ts]

    subgraph Parser
        D --> E{Line analysis}
        E -->|matches item pattern| F[name + price]
        E -->|matches tax pattern| G[tax amount]
        E -->|matches tip pattern| H[tip amount]
        E -->|skip line| I[subtotal / total /\ncard / server / etc.]
    end

    F --> J[items array]
    G --> K[tax field]
    H --> L[tip field]
    J --> M[ItemsEditor\nfor review]
    K --> M
    L --> M
```

Tesseract downloads the English language model (~10 MB) on first use and caches it in the browser. Subsequent runs are instant.

---

## Payment deep links

| Method | URL format | Notes |
|--------|-----------|-------|
| Venmo | `venmo://paycharge?txn=pay&recipients=HANDLE&amount=X&note=...` | Opens Venmo app |
| Cash App | `https://cash.app/$HANDLE/X` | Opens Cash App |
| PayPal | `https://paypal.me/HANDLE/X` | Opens PayPal |
| Zelle | *(none)* | Shows handle with copy button |

---

## Setup

### 1. Supabase — database

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run the contents of [`supabase/schema.sql`](./supabase/schema.sql).
3. Go to **Settings → API** — copy your **Project URL** and **anon key**.

### 2. Supabase — auth (optional but recommended)

**Magic link** works out of the box once you set the Site URL.

**Google OAuth:**
1. Go to **Authentication → Providers → Google** and enable it.
2. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com) and paste the Client ID + Secret into Supabase.
3. Go to **Authentication → URL Configuration** and set:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: `https://your-app.vercel.app/auth/callback`
   - For local dev, also add: `http://localhost:3000/auth/callback`

The app uses PKCE flow. After sign-in, Supabase redirects to `/auth/callback`, which forwards to `/auth/confirm` where the browser exchanges the code for a session.

### 3. Environment variables

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Deploy to Vercel

1. Import this repo at [vercel.com/new](https://vercel.com/new).
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` under **Environment Variables**.
3. Click **Deploy**.

Every push to `main` redeploys automatically. No additional config needed — Vercel detects Next.js automatically.

---

## Local dev commands

```bash
npm run dev      # start dev server at localhost:3000
npm run build    # production build with type checking
npm run lint     # ESLint
```
