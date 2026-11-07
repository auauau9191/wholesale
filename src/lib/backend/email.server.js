// Email, sent through Resend (resend.com, free for 3,000 emails a month) when RESEND_API_KEY is set.
// Without a key the email is skipped and the app carries on (the reminder shows as not sent).
// Templates are the MJML files in base44/emails; their text and button are pulled out into simple HTML.
const templates = import.meta.glob("/base44/emails/*.html", { query: "?raw", import: "default", eager: true });

const fill = (text, vars) => String(text ?? "").replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi, (_, k) => vars?.[k] ?? "");
const escape = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function render(name, vars) {
  const source = Object.entries(templates).find(([path]) => path.endsWith(`/${name}.html`))?.[1];
  if (!source) return null;
  const subject = fill(source.match(/<mj-title>([\s\S]*?)<\/mj-title>/)?.[1], vars).trim();
  const blocks = [...source.matchAll(/<mj-text[^>]*>([\s\S]*?)<\/mj-text>/g)].map((m) => fill(m[1], vars).trim());
  const button = source.match(/<mj-button[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/mj-button>/);
  const html = [
    `<div style="font-family:Helvetica,Arial,sans-serif;color:#23290f;font-size:15px;line-height:1.6;max-width:560px">`,
    ...blocks.map((b) => `<div style="margin:0 0 14px">${b}</div>`),
    button ? `<p><a href="${escape(fill(button[1], vars))}" style="background:#23290f;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">${fill(button[2], vars).trim()}</a></p>` : "",
    `</div>`,
  ].join("");
  return { subject, html };
}

export async function sendEmail({ to, subject, body, template_name, variables, from_name }, env) {
  const key = env("RESEND_API_KEY");
  const rendered = template_name ? render(template_name, variables) : null;
  const message = {
    subject: rendered?.subject ?? subject ?? "Wholesale System",
    html: rendered?.html ?? `<div style="font-family:Helvetica,Arial,sans-serif">${body ?? ""}</div>`,
  };
  if (!key) {
    console.log(`[email skipped: RESEND_API_KEY not set] to=${to} subject=${message.subject}`);
    return { success: false, message: "Email isn't set up yet (add RESEND_API_KEY)." };
  }
  const from = env("EMAIL_FROM") ?? `${from_name ?? "Wholesale System"} <onboarding@resend.dev>`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], ...message }),
  });
  if (!response.ok) return { success: false, message: `Email failed (${response.status}).` };
  return { success: true };
}
