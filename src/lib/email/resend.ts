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

function emailLayout({
  eyebrow,
  headline,
  greeting,
  bodyHtml,
  footerNote,
}: {
  eyebrow: string;
  headline: string;
  greeting: string;
  bodyHtml: string;
  footerNote: string;
}) {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px 12px;background:#eef6f1;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:20px;">
      <span style="display:inline-block;background:linear-gradient(135deg,#2d6a4f,#52b788);color:white;font-weight:700;font-size:13px;letter-spacing:0.08em;padding:6px 14px;border-radius:999px;">BabyIdo</span>
    </div>
    <div style="background:white;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(45,106,79,0.12);">
      <div style="background:linear-gradient(135deg,#d8f3dc 0%,#b7e4c7 50%,#95d5b2 100%);padding:28px 24px 22px;">
        <p style="margin:0 0 6px;color:#1b4332;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;opacity:0.8;">${eyebrow}</p>
        <h1 style="margin:0;color:#1b4332;font-size:24px;line-height:1.35;font-weight:800;">${headline}</h1>
      </div>
      <div style="padding:24px;">
        <p style="margin:0 0 16px;color:#444;font-size:15px;line-height:1.6;">${greeting}</p>
        ${bodyHtml}
        <p style="margin:24px 0 0;color:#888;font-size:13px;line-height:1.55;border-top:1px solid #eef2ef;padding-top:16px;">${footerNote}</p>
      </div>
    </div>
    <p style="text-align:center;color:#aab5ad;font-size:11px;margin-top:16px;">BabyIdo · מעקב חכם וחמים להורים</p>
  </div>
</body>
</html>`;
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
  const timeLine = scheduledTime
    ? `הגיע הזמן לקבל חיסון מחר בשעה <strong>${scheduledTime}</strong>`
    : "הגיע הזמן לקבל חיסון מחר";

  const bodyHtml = `
    <p style="margin:0 0 14px;color:#333;font-size:16px;line-height:1.65;">${timeLine} עבור <strong>${babyName}</strong>.</p>
    <div style="background:#f6fbf8;border:1.5px solid #b7e4c7;border-radius:14px;padding:18px;margin:16px 0;">
      <p style="margin:0;font-size:18px;font-weight:800;color:#1b4332;">💉 ${vaccineName}</p>
      <p style="margin:10px 0 0;color:#555;font-size:15px;">📅 ${scheduledDate}${scheduledTime ? ` · 🕐 ${scheduledTime}` : ""}</p>
      ${clinicNote ? `<p style="margin:10px 0 0;color:#777;font-size:14px;">📍 ${clinicNote}</p>` : ""}
    </div>
    <p style="margin:0;color:#666;font-size:14px;line-height:1.55;">ניתן לעדכן את התור, לסמן בוצע ולתעד הערות באפליקציה.</p>
  `;

  return emailLayout({
    eyebrow: "תזכורת חיסון",
    headline: "מחר יש חיסון 🔔",
    greeting: `שלום ${parentName},`,
    bodyHtml,
    footerNote:
      "זוהי תזכורת מעקב בלבד — לא ייעוץ רפואי. בכל שאלה פנו לרופא הילדים או לאחות טיפת חלב.",
  });
}

export function genericNotificationHtml({
  parentName,
  title,
  body,
  when,
  ctaLabel,
  ctaHref,
}: {
  parentName: string;
  title: string;
  body: string;
  when?: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  const bodyHtml = `
    <div style="background:#f8faf9;border:1.5px solid #e2e8f0;border-radius:14px;padding:18px;margin:16px 0;">
      <p style="margin:0;font-size:17px;font-weight:800;color:#1b4332;">${title}</p>
      <p style="margin:10px 0 0;color:#555;font-size:15px;line-height:1.55;">${body}</p>
      ${when ? `<p style="margin:10px 0 0;color:#777;font-size:14px;">📅 ${when}</p>` : ""}
    </div>
    ${
      ctaLabel && ctaHref
        ? `<a href="${ctaHref}" style="display:inline-block;margin-top:8px;background:#2d6a4f;color:white;text-decoration:none;font-weight:700;font-size:14px;padding:12px 20px;border-radius:12px;">${ctaLabel}</a>`
        : ""
    }
  `;

  return emailLayout({
    eyebrow: "התראה מ-BabyIdo",
    headline: title,
    greeting: `שלום ${parentName},`,
    bodyHtml,
    footerNote: "תזכורת מעקב בלבד — לא ייעוץ רפואי.",
  });
}
