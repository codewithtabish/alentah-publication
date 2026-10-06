// src/lib/resend/welcome-email.ts
// ============================================================
// Welcome email template — ALENTAH
// Returns { subject, html, text } for Resend.
// ============================================================

const SITE_URL = "https://www.alentah.com";

export function buildWelcomeEmail() {
  const subject = "Welcome to Alentah — see you Sunday";

  const text = [
    "Welcome to Alentah.",
    "",
    "You're in. Every Sunday, one slow story lands in your inbox —",
    "no noise, no clickbait, just the good stuff.",
    "",
    "While you wait, here's something to read:",
    `${SITE_URL}`,
    "",
    "— The Editorial Team",
    "Alentah · Independent Editorial",
    `Unsubscribe: ${SITE_URL}/unsubscribe`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${subject}</title>
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
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:32px;line-height:1.15;letter-spacing:-0.02em;color:#1A1714;font-weight:600;">
                Welcome to Alentah.
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 40px 0 40px;">
              <p style="margin:0 0 16px 0;font-size:15px;line-height:1.65;color:#4A423B;">
                You&rsquo;re in. Every Sunday, one slow story lands in your inbox &mdash;
                no noise, no clickbait, just the good stuff.
              </p>
              <p style="margin:0 0 24px 0;font-size:15px;line-height:1.65;color:#4A423B;">
                While you wait, here&rsquo;s something worth reading.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px 32px 40px;">
              <a href="${SITE_URL}"
                 style="display:inline-block;background:#6B4A2F;color:#FFFFFF;text-decoration:none;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;padding:14px 28px;border-radius:999px;">
                Start reading
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:#EAE3D9;"></div>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 40px 32px 40px;">
              <p style="margin:0 0 6px 0;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:15px;color:#4A423B;">
                &mdash; The Editorial Team.
              </p>
              <p style="margin:0;font-size:11px;color:#8A7F73;">
                Alentah · Slow Journalism for Curious Minds
              </p>
            </td>
          </tr>
        </table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;margin-top:20px;">
          <tr>
            <td align="center" style="padding:0 20px;">
              <p style="margin:0;font-size:11px;color:#8A7F73;line-height:1.6;">
                You&rsquo;re receiving this because you subscribed at
                <a href="${SITE_URL}" style="color:#6B4A2F;text-decoration:underline;">alentah.com</a>.
                <br />
                <a href="${SITE_URL}/unsubscribe" style="color:#8A7F73;text-decoration:underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html, text };
}