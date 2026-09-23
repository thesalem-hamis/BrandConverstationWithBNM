import { serve } from "https://deno.land/std@0.167.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Brand Conversations <hello@yourdomain.com>";
const REPLY_TO_EMAIL = Deno.env.get("REPLY_TO_EMAIL") || "hello@yourdomain.com";

const TELEGRAM_LINK = "https://t.me/+rjyWoEWqv2gzZmQ8";

function getConfirmationEmailHtml(participantName: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>You're invited to the Brand Conversations with BNM group</title>
      </head>
      <body style="
        margin: 0;
        padding: 0;
        background-color: #f4f2ef;
        font-family: Arial, Helvetica, sans-serif;
        color: #1c1815;
      ">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f2ef; padding: 40px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden;">
                <tr>
                  <td align="center" style="padding: 40px 30px 25px;">
                    <img src="YOUR_LOGO_URL_HERE" alt="Adebimpe Mohammed" width="110" style="display: block; max-width: 110px; height: auto;" />
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 40px 30px;">
                    <h1 style="margin: 0; font-size: 30px; line-height: 1.2; font-weight: 600; color: #1c1815;">
                      You're invited to the
                      <br />
                      Brand Conversations with BNM group
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 40px 40px; font-size: 16px; line-height: 1.7; color: #5b534c;">
                    <p style="margin: 0 0 22px;">Hello ${participantName},</p>
                    <p style="margin: 0 0 22px;">
                      Thank you for registering your interest in
                      <strong style="color: #1c1815;">Brand Conversations with BNM</strong>.
                      I'm looking forward to having you with us this Sunday, 27 September.
                    </p>
                    <p style="margin: 0 0 22px;">
                      I've created a Telegram group to bring everyone together ahead of the event.
                      It's where we'll share the confirmed joining details, reminders and any updates.
                      You'll also be able to introduce yourself and share a question you'd like us to consider.
                    </p>
                    <table cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                      <tr>
                        <td align="center" style="background-color: #7b2418; border-radius: 8px;">
                          <a href="${TELEGRAM_LINK}" target="_blank" style="display: inline-block; padding: 15px 24px; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600;">
                            Join the Telegram Group
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 0 0 22px;">
                      Please join the group here:
                      <a href="${TELEGRAM_LINK}" style="color: #7b2418; text-decoration: underline;">Join Telegram Group</a>
                    </p>
                    <p style="margin: 0 0 22px;">
                      Once you're in, take a look at the pinned message for the latest event information.
                      You're welcome to introduce yourself, but there's no pressure to do so.
                    </p>
                    <p style="margin: 0 0 30px;">I'll see you there.</p>
                    <p style="margin: 0;">Warmly,</p>
                    <p style="margin: 6px 0 0; color: #1c1815; font-weight: 600;">Adebimpe Mohammed</p>
                    <p style="margin: 3px 0 0; font-size: 14px;">Global Brand Strategist/ Advisor</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { email, first_name, second_name } = await req.json();

    if (!email || !first_name) {
      return new Response(JSON.stringify({ error: "email and first_name are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const participantName = `${first_name} ${second_name || ""}`.trim();

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email provider not configured. Set RESEND_API_KEY." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: "You're invited to the Brand Conversations with BNM group",
        html: getConfirmationEmailHtml(participantName),
        reply_to: REPLY_TO_EMAIL,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend error:", data);
      return new Response(JSON.stringify({ error: "Failed to send email", detail: data }), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, id: data.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Function error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});