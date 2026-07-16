import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "BabyIdo <onboarding@resend.dev>";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping send to", to);
    return { skipped: true as const };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) throw new Error(error.message);
  return { skipped: false as const, id: data?.id };
}

export function vaccinationReminderHtml({
  parentName,
  babyName,
  vaccineName,
  scheduledDate,
  scheduledTime,
  clinicNote,
}: {
  parentName: string;
  babyName: string;
  vaccineName: string;
  scheduledDate: string;
  scheduledTime?: string;
  clinicNote?: string;
}) {
  const when = scheduledTime ? `${scheduledDate} בשעה ${scheduledTime}` : scheduledDate;
  return `
    <div dir="rtl" style="font-family:Segoe UI,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#f8faf9;border-radius:16px;">
      <h1 style="color:#2d6a4f;margin:0 0 8px;font-size:22px;">תזכורת חיסון מחר 🔔</h1>
      <p style="color:#444;margin:0 0 16px;">שלום ${parentName},</p>
      <p style="color:#333;line-height:1.6;">מחר מתוכנן חיסון עבור <strong>${babyName}</strong>:</p>
      <div style="background:white;border:2px solid #95d5b2;border-radius:12px;padding:16px;margin:16px 0;">
        <p style="margin:0;font-size:18px;font-weight:bold;color:#1b4332;">${vaccineName}</p>
        <p style="margin:8px 0 0;color:#555;">📅 ${when}</p>
        ${clinicNote ? `<p style="margin:8px 0 0;color:#777;font-size:14px;">${clinicNote}</p>` : ""}
      </div>
      <p style="color:#666;font-size:14px;line-height:1.5;">זוהי תזכורת מעקב בלבד מ-BabyIdo — לא ייעוץ רפואי. בכל שאלה פנו לרופא או לאחות טיפת חלב.</p>
      <p style="color:#999;font-size:12px;margin-top:24px;">BabyIdo · מעקב חכם לתינוקות</p>
    </div>
  `;
}
