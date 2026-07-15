# התחברות עם Google — BabyIdo

## שלב 1: Google Cloud Console

1. פתחו [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. **Create Credentials** → **OAuth client ID**
3. סוג: **Web application**
4. שם: `BabyIdo` (או כל שם)

## שלב 2: Redirect URIs

הוסיפו את הכתובות הבאות תחת **Authorized redirect URIs**:

```
http://localhost:3000/api/auth/callback/google
https://babyido.com/api/auth/callback/google
https://www.babyido.com/api/auth/callback/google
```

## שלב 3: משתני סביבה

**מקומי** (`.env.local`):

```env
AUTH_GOOGLE_ID=xxxxx.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=GOCSPX-xxxxx
AUTH_URL=http://localhost:3000
```

**פרודקשן** (Vercel → Settings → Environment Variables):

```env
AUTH_GOOGLE_ID=xxxxx.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=GOCSPX-xxxxx
AUTH_URL=https://babyido.com
```

## שלב 4: הפעלה

```bash
npm run dev
```

עכשיו כפתור **התחברות עם Google** יעבוד בהרשמה ובהתחברות.

## הערות

- אם מופיעה שגיאת `client_id` — המפתחות חסרים או שגויים
- משתמשי Google נוצרים אוטומטית ב-MongoDB ב-database `babydo`
- אפשר לקשר לאותו פרויקט Google Cloud של Bizuply — פשוט הוסיפו Redirect URI חדש
