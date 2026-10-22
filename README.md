# 🛍️ LoyalShop — Regular Customer Loyalty Discount E-Commerce Platform

LoyalShop is a production-grade full-stack e-commerce platform engineered with a **"Regular Customer Loyalty Discount"** as its core business growth strategy.

---

## 🎯 1. Business Strategy & Core Rules

1. **10-Day Rolling Window**: Any completed (paid) order activates or resets a 10-day timer (`REGULAR_WINDOW_DAYS = 10`).
2. **Automatic Checkout Discount**: A customer with an active window gets an automatic discount on their cart at checkout. No coupon codes required.
3. **Streak Tiers**:
   - **Streak 1–2**: 10% Base Discount
   - **Streak 3–5**: 15% Tier Discount
   - **Streak 6+**: 20% Top Tier Discount
   - **Hard Cap**: 25% Maximum Discount Cap
4. **Window Expiration**: If 10 full days elapse without an order, status lapses to 0% discount and streak resets.
5. **Win-Back Mechanism**: The very next order reactivates Regular status and restarts the streak.
6. **Refund & Cancellation Protection**: Cancelled or refunded orders are excluded from qualifying loyalty calculations; refunds automatically recalculate status from remaining valid paid orders.
7. **Scheduled Automation**: Daily `node-cron` checks customer expiration and triggers reminder notifications on **Day 7** and **Day 9** of inactivity.

---

## 🛠️ 2. Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Custom Brand Tokens
- **Database & ORM**: SQLite (Dev) / PostgreSQL compatible via Prisma ORM
- **Auth**: JWT in secure `httpOnly` cookies with bcrypt password hashing
- **Business Engine**: Pure, deterministic discount module with 100% test coverage
- **Scheduler**: `node-cron` running daily at midnight UTC
- **Testing**: Vitest suite covering all boundary and edge cases

---

## 🚀 3. Getting Started

### Prerequisites
Node.js 18+ and npm installed.

### Installation & Setup
```bash
# Navigate to project directory
cd loyalshop

# Database sync & seed
npx prisma db push
npx tsx prisma/seed.ts

# Run the test suite
npx vitest run

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👤 4. Pre-Seeded Test Personas

All personas share the password: `Password123!` (Admin password: `Admin123!`). 1-click login buttons are provided directly on the Login page:

| Persona | Email | State & Loyalty Perk |
|---|---|---|
| **Alex Active** | `alex@example.com` | Active Regular, Streak 2, **10% OFF**, 8 days left |
| **Emma Expiring** | `emma@example.com` | Expiring Soon (Day 9), **10% OFF**, **1 day left**, Day 9 reminder |
| **Liam Lapsed** | `liam@example.com` | Lapsed (Bought 15 days ago), **0% OFF**, Win-Back banner |
| **Noah New** | `noah@example.com` | First-time visitor, 0 orders, no streak yet |
| **Sophia Streak** | `sophia@example.com` | VIP Regular, Streak 6, **20% OFF**, 9 days left |
| **Store Admin** | `admin@loyalshop.com` | Admin with full access to Dashboard, Catalog, Orders, and Settings |

---

## 🧪 5. Testing & Verification

Run the pure discount engine Vitest suite:
```bash
npx vitest run
```

### Verified Edge Cases:
- First-time customer initialization
- Purchase on exactly Day 10 boundary (valid)
- Purchase on Day 11 boundary (lapsed / reset)
- Multiple orders placed in a single day
- Discount hard cap enforcement (25%)
- UTC timezone arithmetic
- Day 7 and Day 9 inactivity reminder triggers
- Automatic loyalty resynchronization upon refund

---

## 📁 6. Project Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── auth/           # Login, Register, Me, Logout
│   │   ├── products/       # Public & detail endpoints
│   │   ├── orders/         # Authoritative checkout & loyalty update
│   │   ├── loyalty/        # Current user status & countdown
│   │   ├── notifications/  # User reminders & notifications
│   │   ├── admin/          # Stats, Products CRUD, Orders, Customers, Settings
│   │   └── dev/            # Fast-forward simulation endpoints
│   ├── account/            # Customer loyalty card, countdown ring, orders
│   ├── admin/              # Full Admin dashboard & control center
│   ├── cart/               # Live cart with loyalty savings calculation
│   ├── checkout/           # Mock Stripe payment & confirmation
│   ├── loyalty/            # Loyalty Explainer & FAQ page
│   ├── shop/               # Catalog with member strikethrough prices
│   ├── login/ & register/  # Authentication with 1-click test profiles
│   ├── layout.tsx          # Root layout with top loyalty banner & navbar
│   └── page.tsx            # Home page hero & 3-step explainer
├── components/             # Reusable UI cards, countdown ring, banners
├── context/                # AuthContext & CartContext
├── lib/
│   ├── auth.ts             # JWT cookie & rate limiting utilities
│   ├── config.ts           # Centralized business rule defaults
│   ├── cron.ts             # Daily status check & reminder job
│   ├── db.ts               # Prisma singleton client
│   ├── discount-engine.ts  # Pure business logic module
│   ├── discount-engine.test.ts # Vitest suite (18 passing tests)
│   ├── loyalty-sync.ts     # Replay & status resync upon refund
│   └── validations.ts      # Zod validation schemas
prisma/
├── schema.prisma           # Complete database schema
└── seed.ts                 # 12 products, 1 admin, 5 customers, settings
```
