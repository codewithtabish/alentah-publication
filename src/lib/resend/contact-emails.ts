// src/lib/resend/contact-emails.ts
// ============================================================
// Contact form email templates — ALENTAH
//   buildContactNotificationEmail() → to editorial inbox
//   buildContactAutoReplyEmail()    → to the sender
// ============================================================

const SITE_URL = "https://www.alentah.com";

const SUBJECT_LABELS: Record<string, string> = {
  editorial: "Editorial pitch",
  correction: "Correction",
  partnership: "Partnership",
  feedback: "Feedback",
  other: "Other",
};

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ────────────────────────────────────────────────────────────
// 1. INTERNAL — notification to your editorial inbox
// ────────────────────────────────────────────────────────────

export function buildContactNotificationEmail(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
  sendCopy: boolean;
}) {
  const { name, email, subject, message, sendCopy } = params;
  const subjectLabel = SUBJECT_LABELS[subject] ?? subject ?? "New message";
  const emailSubject = `[Contact] ${subjectLabel} — ${name}`;

  const text = [
    `New contact form submission`,
    ``,
    `From:    ${name} <${email}>`,
    `Subject: ${subjectLabel}`,
    `Copy:    ${sendCopy ? "yes" : "no"}`,
    ``,
    `---`,
    ``,
    message,
    ``,
    `---`,
    ``,
    `Reply directly to this email to respond.`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(emailSubject)}</title>
</head>
<body style="margin:0;padding:0;background:#FAF7F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1A1714;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FAF7F2;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#FFFFFF;border:1px solid #EAE3D9;border-radius:20px;overflow:hidden;">
          <tr>
            <td style="padding:28px 36px 0 36px;">
              <p style="margin:0;font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:#6B4A2F;font-weight:700;">
                Alentah · Contact
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 36px 0 36px;">
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.2;letter-spacing:-0.02em;color:#1A1714;font-weight:600;">
                ${escapeHtml(subjectLabel)}
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 36px 0 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:14px;line-height:1.6;">
                <tr>
                  <td style="padding:4px 0;width:90px;color:#8A7F73;font-weight:600;">From</td>
                  <td style="padding:4px 0;color:#1A1714;">
                    ${escapeHtml(name)} &lt;<a href="mailto:${escapeHtml(email)}" style="color:#6B4A2F;text-decoration:underline;">${escapeHtml(email)}</a>&gt;
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0;color:#8A7F73;font-weight:600;">Subject</td>
                  <td style="padding:4px 0;color:#1A1714;">${escapeHtml(subjectLabel)}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;color:#8A7F73;font-weight:600;">Copy</td>
                  <td style="padding:4px 0;color:#1A1714;">${sendCopy ? "yes" : "no"}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 36px 0 36px;">
              <div style="height:1px;background:#EAE3D9;"></div>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 36px 32px 36px;">
              <p style="margin:0 0 10px 0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8A7F73;font-weight:700;">
                Message
              </p>
              <div style="font-size:15px;line-height:1.7;color:#1A1714;white-space:pre-wrap;">${escapeHtml(message)}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 32px 36px;">
              <a href="mailto:${escapeHtml(email)}?subject=Re%3A%20${encodeURIComponent(subjectLabel)}"
                 style="display:inline-block;background:#6B4A2F;color:#FFFFFF;text-decoration:none;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;padding:12px 24px;border-radius:999px;">
                Reply to ${escapeHtml(name.split(" ")[0] || name)}
              </a>
            </td>
          </tr>
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin-top:16px;">
          <tr>
            <td align="center" style="padding:0 20px;">
              <p style="margin:0;font-size:11px;color:#8A7F73;line-height:1.6;">
                Sent from the contact form at
                <a href="${SITE_URL}/contact" style="color:#6B4A2F;text-decoration:underline;">alentah.com/contact</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject: emailSubject, html, text };
}

// ────────────────────────────────────────────────────────────
// 2. AUTO-REPLY — what the sender gets
// ────────────────────────────────────────────────────────────

export function buildContactAutoReplyEmail(params: {
  name: string;
  subject: string;
  message: string;
  includeCopy: boolean;
}) {
  const { name, subject, message, includeCopy } = params;
  const firstName = name.split(" ")[0] || name;
  const subjectLabel = SUBJECT_LABELS[subject] ?? subject ?? "your message";
  const emailSubject = "We got your message — Alentah";

  const text = [
    `Hi ${firstName},`,
    ``,
    `Thanks for writing to Alentah. Your message about "${subjectLabel}" just landed in the editorial inbox.`,
    ``,
    `We read everything, and we reply within 5–7 days.`,
    ``,
    includeCopy
      ? [
          `Here's a copy of what you sent:`,
          ``,
          `---`,
          ``,
          message,
          ``,
          `---`,
        ].join("\n")
      : "",
    `— The Editorial Team`,
    `Alentah · Slow Journalism for Curious Minds`,
    ``,
    `You can reply to this email if you need to add anything.`,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(emailSubject)}</title>
</head>
<body style="margin:0;padding:0;background:#FAF7F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1A1714;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FAF7F2;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#FFFFFF;border:1px solid #EAE3D9;border-radius:24px;overflow:hidden;">
          <tr>
            <td style="padding:32px 40px 0 40px;">
              <p style="margin:0;font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:#6B4A2F;font-weight:700;">
                Alentah · Independent Editorial
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 0 40px;">
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.2;letter-spacing:-0.02em;color:#1A1714;font-weight:600;">
                Thanks for writing, ${escapeHtml(firstName)}.
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 0 40px;">
              <p style="margin:0 0 14px 0;font-size:15px;line-height:1.65;color:#4A423B;">
                Your message about <strong>${escapeHtml(subjectLabel)}</strong> just landed in the editorial inbox.
              </p>
              <p style="margin:0 0 14px 0;font-size:15px;line-height:1.65;color:#4A423B;">
                We read everything, and we reply within 5&ndash;7 days.
              </p>
            </td>
          </tr>
          ${
            includeCopy
              ? `
          <tr>
            <td style="padding:8px 40px 0 40px;">
              <div style="height:1px;background:#EAE3D9;"></div>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 40px 0 40px;">
              <p style="margin:0 0 10px 0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8A7F73;font-weight:700;">
                Your message
              </p>
              <div style="font-size:14px;line-height:1.7;color:#1A1714;background:#FAF7F2;border:1px solid #EAE3D9;border-radius:12px;padding:16px;white-space:pre-wrap;">${escapeHtml(message)}</div>
            </td>
          </tr>
          `
              : ""
          }
          <tr>
            <td style="padding:28px 40px 0 40px;">
              <div style="height:1px;background:#EAE3D9;"></div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 32px 40px;">
              <p style="margin:0 0 6px 0;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:15px;color:#4A423B;">
                &mdash; The Editorial Team.
              </p>
              <p style="margin:0;font-size:11px;color:#8A7F73;">
                Alentah &middot; Slow Journalism for Curious Minds
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject: emailSubject, html, text };
}