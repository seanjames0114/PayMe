# PayMe

> Split restaurant bills without the awkward math.

Snap a receipt, share a link — everyone claims what they ordered and pays you directly in one tap. No signup required for friends. No math required for anyone.

**Stack:** Next.js 16 · TypeScript · Tailwind CSS · Tesseract.js · Supabase · Vercel

---

## Features

| | |
|---|---|
| **Free browser OCR** | Tesseract.js reads your receipt on-device. No API key, no rate limits, no data uploaded. |
| **Real-time table** | Friends join via a shared link and see each other claim items live via Supabase Realtime. |
| **Fair splits** | Multiple people can split a single item. Tax and tip divide proportionally by what you ordered. |
| **One-tap payment** | Deep links open Venmo, Cash App, or PayPal pre-filled with the exact amount owed. |

---

## How it works

```mermaid
flowchart LR
    A([📷 Snap receipt]) --> B([🔍 OCR extracts items])
    B --> C([✏️ Review & edit])
    C --> D([🔗 Share link])
    D --> E([🪑 Friends join & claim])
    E --> F([💸 Everyone pays you])
```
## System architecture

```mermaid
graph TB
    subgraph client [Browser]
        direction TB
        UI[React UI\nNext.js App Router]
        OCR[Tesseract.js\nOCR Engine]
        LS[(localStorage\nparticipant ID)]
    end

    subgraph vercel [Vercel — Edge Network]
        SSR[Next.js SSR\nPage rendering]
        API[API Route\nPOST /api/sessions]
    end

    subgraph supabase [Supabase — Free Tier]
        DB[(PostgreSQL\nDatabase)]
        RT[Realtime\nWebSocket]
        RLS[Row Level\nSecurity]
    end

    OCR -->|parsed items| UI
    UI -->|navigate| SSR
    UI -->|create session| API
    API -->|insert rows| DB
    UI <-->|subscribe changes| RT
    RT -->|watches| DB
    RLS -->|enforces policies| DB
    UI -->|store participant id| LS
```

---

## Database schema

```mermaid
erDiagram
    sessions {
        uuid id PK
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

    sessions ||--o{ items        : "has"
    sessions ||--o{ participants : "has"
    participants ||--o{ selections : "makes"
    items        ||--o{ selections : "claimed in"
```

---

## Real-time sequence

```mermaid
sequenceDiagram
    actor O as Organizer
    participant V as Vercel API
    participant DB as Supabase DB
    participant RT as Supabase Realtime
    actor F as Friend

    O->>V: POST /api/sessions
    V->>DB: INSERT session + items
    V-->>O: { sessionId }
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
│   ├── page.tsx                   # Landing page
│   ├── create/
│   │   └── page.tsx               # 4-step wizard (upload → OCR → items → payment)
│   ├── session/
│   │   └── [id]/
│   │       └── page.tsx           # Live session room with realtime
│   └── api/
│       └── sessions/
│           └── route.ts           # POST — creates session + items in Supabase
│
├── components/
│   ├── landing/
│   │   ├── Hero.tsx
│   │   └── HowItWorks.tsx
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
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Spinner.tsx
│
├── lib/
│   ├── ocr.ts                     # Tesseract.js wrapper with progress callback
│   ├── receiptParser.ts           # OCR text → structured items[] with price parsing
│   ├── supabase.ts                # Supabase browser client
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

### 1. Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run the contents of [`supabase/schema.sql`](./supabase/schema.sql).
3. Go to **Settings → API** — copy your **Project URL** and **anon key**.

### 2. Environment variables

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Deploy to Vercel

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
