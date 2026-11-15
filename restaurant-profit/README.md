# ልዩ ሽሮ (Liyu Shiro) - Restaurant Profit Tracker & Digital Menu

A production-ready, mobile-first restaurant management system, real-time profit tracker, and public customer QR menu built for **ልዩ ሽሮ (Liyu Shiro)**.

---

## 🌟 Key Features

### 1. 📱 Mobile-First Quick Sale Logger (Sell Tab)
- Real-time sale recording with zero-lag optimistic UI.
- Instant calculation of unit profit and daily profit.
- Quick quantity increment/decrement controls.
- Fast food search and category chips.

### 2. 📅 Ethiopian Calendar Profit & Sales History (History Tab)
- Track daily, weekly, and monthly profits using the **Ethiopian Calendar (E.C.)**.
- Interactive month selector (መስከረም፣ ጥቅምት፣ ኅዳር፣ ታኅሣሥ፣ ጥር፣ የካቲት፣ መጋቢት፣ ሚያዝያ፣ ግንቦት፣ ሰኔ፣ ሐምሌ፣ ነሐሴ፣ ጳጉሜ).
- Custom Ethiopian date range filter (`ከቀን ... እስከ ቀን ...`).
- High-contrast visual date pickers optimized for mobile screens.
- Monthly performance summary KPI cards (ወርሃዊ ትርፍ፣ ወርሃዊ ገቢ፣ የተሸጡ ምግቦች፣ አማካይ/ቀን).

### 3. 📋 Categorized Food Menu Management (Menu Tab)
- Full menu categorized by:
  - **የጾም ቁርስ** (Fasting Breakfast)
  - **የፆም ምሳ** (Fasting Lunch)
  - **የፍስክ ቁርስ** (Non-Fasting Breakfast)
  - **የፍስክ ምሳ** (Non-Fasting Lunch)
  - **መጠጦች** (Drinks)
  - **ትኩስ ነገሮች** (Hot Beverages)
  - Custom categories supported.
- Quick toggle switch to activate/deactivate foods from customer menu.
- Add and edit food items with optional photo URLs.
- Safe deletion handling (protects historical sales data with user-friendly notices).

### 4. 🍽️ Customer-Facing Digital QR Menu (`/menu`)
- Elegant, fast-loading digital menu for dine-in customers via QR code.
- Authentic Ethiopian food branding with high-resolution hero photo.
- Real-time price display in Ethiopian Birr (ETB).
- Category tabs and instant search.
- One-tap phone ordering button (`📞 ደውሉ`).

### 5. 📊 Excel & Accounting Ready CSV Export (`/api/sales/export`)
- One-click export for any filtered date range.
- **UTF-8 BOM (`\uFEFF`) encoded** for 100% clean Amharic character display in Microsoft Excel on Windows & Mac.
- Formatted numerical values ready for automatic `=SUM()` calculations.
- Dual date tracking: Ethiopian Date (E.C.) and Gregorian Date (G.C.).
- Automatic totals row at the bottom.

### 6. 🔐 Secure Phone & 4-Digit PIN Authentication
- Owners sign in with their Ethiopian phone number (e.g. `0911...` or `+251911...`) and 4-digit PIN/password.
- Self-service password change modal right from the dashboard header.
- Multi-tier security with Supabase Row Level Security (RLS). Internal financial data (cost, profit, sales) is strictly hidden from public menu visitors.

---

## 🚀 Getting Started (Local Development)

### 1. Prerequisites
- Node.js 18+ or 20+
- npm, yarn, or pnpm
- Supabase project

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/jho-G/-profit-tracker.git
cd -profit-tracker/restaurant-profit

# Install dependencies
npm install
```

### 3. Configure Environment Variables
Copy the template file to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase project credentials in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the system:
- Customer Menu: [http://localhost:3000/menu](http://localhost:3000/menu)
- Admin Login: [http://localhost:3000/login](http://localhost:3000/login)
- Admin Dashboard: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

---

## 🌐 Production Deployment (Vercel)

1. Push your repository to GitHub.
2. Import the project into **[Vercel](https://vercel.com)**:
   - Root Directory: `restaurant-profit`
   - Framework Preset: `Next.js`
3. Add the environment variables from `.env.local` to Vercel Project Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Click **Deploy**.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 16 (Turbopack, App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security, Auth)
- **Calendar**: Custom Ethiopian Calendar Algorithm with pagume leap year calculations
- **Icons & QR**: SVG QR Generator & Unicode Amharic symbols
