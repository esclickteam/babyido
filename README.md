# BabyDo

**Everything your baby needs, in one place.**

מערכת Web מודרנית למעקב אחר גדילה, התפתחות ותזונת תינוקות — בעברית ובאנגלית.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4 + shadcn/ui
- Framer Motion
- MongoDB + Mongoose
- NextAuth (Credentials + Google)
- TanStack Query + Zustand
- next-intl (he/en, RTL)

## התחלה מהירה

```bash
# 1. התקנת תלויות
npm install

# 2. הגדרת משתני סביבה
cp .env.example .env.local
# ערכו MONGODB_URI ו-AUTH_SECRET

# 3. הרצה
npm run dev
```

פתחו [http://localhost:3000/he](http://localhost:3000/he)

## מבנה הפרויקט

```
src/
├── app/[locale]/          # דפים (landing, auth, dashboard)
├── app/api/               # API routes
├── components/            # UI לפי תחום (auth, baby, dashboard, layout...)
├── constants/             # קבועים (ניווט, האכלה, אבני דרך)
├── hooks/                 # React hooks
├── i18n/                  # תרגומים וניווט
├── lib/                   # auth, db, validations
├── models/                # Mongoose schemas
├── services/              # קריאות API
├── stores/                # Zustand state
├── types/                 # TypeScript types
└── utils/                 # פונקציות עזר
```

## מודולים

| מודול | סטטוס |
|-------|--------|
| Auth (התחברות/הרשמה/Google) | ✅ |
| Dashboard + Sidebar | ✅ |
| פרופיל תינוק (ריבוי ילדים) | ✅ |
| מחשבון האכלה | ✅ |
| הגדרות (שפה/ערכת נושא) | ✅ |
| גדילה, האכלה, שינה, טעימות... | 🏗️ scaffold |

## משתני סביבה

ראו `.env.example` לרשימה מלאה.

## הערה משפטית

המידע באפליקציה מיועד למטרות מידע ומעקב בלבד ואינו מהווה ייעוץ רפואי.
