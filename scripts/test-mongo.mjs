/**
 * בדיקת חיבור ל-MongoDB Atlas (database: babydo)
 * הרצה: node scripts/test-mongo.mjs
 */
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("❌ MONGODB_URI לא מוגדר — הרץ מתוך תיקיית הפרויקט עם .env.local");
  process.exit(1);
}

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  const dbName = mongoose.connection.db?.databaseName;
  const collections = await mongoose.connection.db?.listCollections().toArray();
  console.log(`✅ מחובר ל-MongoDB Atlas`);
  console.log(`   Database: ${dbName}`);
  console.log(`   Collections: ${collections?.length ? collections.map((c) => c.name).join(", ") : "(ריק — ייווצר בהרשמה ראשונה)"}`);
  await mongoose.disconnect();
} catch (err) {
  console.error("❌ שגיאת חיבור:", err.message);
  process.exit(1);
}
