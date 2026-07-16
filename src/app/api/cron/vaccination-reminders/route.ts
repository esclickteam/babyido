import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { getVaccineById } from "@/constants/vaccinations";
import { sendEmail, vaccinationReminderHtml } from "@/lib/email/resend";
import { VaccinationRecord } from "@/models/VaccinationRecord";
import { Baby } from "@/models/Baby";
import { User } from "@/models/User";
import { dateOnlyToMongo, getTodayIsrael, isoToDisplay, toDateOnlyString } from "@/utils/date";
import { getReminderDate } from "@/utils/vaccination-schedule";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = getTodayIsrael();
    await connectDB();

    const records = await VaccinationRecord.find({
      completed: false,
      reminderEnabled: true,
      scheduledDate: { $exists: true, $ne: null },
      $or: [{ reminderSentAt: null }, { reminderSentAt: { $exists: false } }],
    }).lean();

    let sent = 0;
    let skipped = 0;

    for (const record of records) {
      if (!record.scheduledDate) continue;
      const scheduledStr = toDateOnlyString(record.scheduledDate);
      if (getReminderDate(scheduledStr) !== today) {
        skipped++;
        continue;
      }

      const vaccine = getVaccineById(record.vaccineId);
      if (!vaccine) continue;

      const baby = await Baby.findById(record.babyId).lean();
      if (!baby) continue;

      const user = await User.findById(baby.userId).lean();
      if (!user?.email) continue;

      const result = await sendEmail({
        to: user.email,
        subject: `תזכורת: חיסון ${vaccine.nameHe} מחר — ${baby.name}`,
        html: vaccinationReminderHtml({
          parentName: user.name,
          babyName: baby.name,
          vaccineName: `${vaccine.nameHe} (${vaccine.doseHe})`,
          scheduledDate: isoToDisplay(scheduledStr),
          clinicNote: vaccine.whereHe,
        }),
      });

      if (!result.skipped) {
        await VaccinationRecord.findByIdAndUpdate(record._id, {
          reminderSentAt: dateOnlyToMongo(today),
        });
        sent++;
      }
    }

    return NextResponse.json({ sent, skipped, today });
  } catch (err) {
    console.error("vaccination reminder cron error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
