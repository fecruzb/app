// HTML layout for transactional emails. Sending lives in integrations/resend.
export function emailLayout(
  title: string,
  bodyHtml: string,
  ctaLabel: string,
  ctaUrl: string,
): string {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:32px 16px;background:#f5f5f5;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#171717;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;">
      <h1 style="margin:0 0 16px;font-size:20px;">${title}</h1>
      <div style="font-size:15px;line-height:1.6;color:#404040;">${bodyHtml}</div>
      <a href="${ctaUrl}" style="display:inline-block;margin-top:24px;padding:12px 24px;background:#171717;color:#ffffff;text-decoration:none;border-radius:8px;font-size:15px;">${ctaLabel}</a>
      <p style="margin-top:24px;font-size:13px;color:#737373;">If the button doesn't work, copy and paste this link into your browser:<br /><a href="${ctaUrl}" style="color:#525252;word-break:break-all;">${ctaUrl}</a></p>
    </div>
  </body>
</html>`;
}
