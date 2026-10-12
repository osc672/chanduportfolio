require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname)));

const requiredEnv = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "CONTACT_TO"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length) {
  console.warn(`Missing environment variables: ${missingEnv.join(", ")}. Email sending will not work until configured.`);
}

const smtpPort = Number(process.env.SMTP_PORT || 587);
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message } = req.body || {};

  if (![name, email, subject, message].every((value) => typeof value === "string" && value.trim())) {
    return res.status(400).json({ error: "Please fill in all fields." });
  }
  if (name.trim().length < 2 || name.length > 80 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
      subject.trim().length < 3 || subject.length > 120 ||
      message.trim().length < 10 || message.length > 5000) {
    return res.status(400).json({ error: "Please check your details and try again." });
  }
  if (missingEnv.length) {
    return res.status(503).json({ error: "Email is not configured yet. Please configure SMTP settings in the .env file." });
  }

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_TO,
      replyTo: { name: name.trim(), address: email.trim() },
      subject: `[Portfolio] ${subject.trim()}`,
      text: `SAI CHANDU · PORTFOLIO CONTACT\nNew message received from your portfolio website.\n\nName: ${name.trim()}\nEmail: ${email.trim()}\nSubject: ${subject.trim()}\n\nMESSAGE\n${message.trim()}\n\nYou can reply directly to this email to contact ${name.trim()}.`,
      html: `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f2f4f7;font-family:Arial,Helvetica,sans-serif;color:#20242c;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f2f4f7;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;">
        <tr><td style="background:#101218;padding:28px 32px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>
            <td width="48" valign="middle"><div style="width:42px;height:42px;line-height:42px;text-align:center;border-radius:12px;background:#c2f970;color:#11150b;font-weight:800;font-size:15px;">SC</div></td>
            <td style="padding-left:12px;vertical-align:middle;"><div style="font-size:16px;line-height:22px;font-weight:700;color:#ffffff;">Sai Chandu<span style="color:#c2f970;">.</span></div><div style="font-size:11px;line-height:18px;letter-spacing:2px;text-transform:uppercase;color:#a8afbd;">Portfolio contact</div></td>
            <td align="right" valign="middle"><span style="display:inline-block;background:#20251d;color:#c2f970;border:1px solid #3a4930;border-radius:20px;padding:7px 10px;font-size:10px;font-weight:700;letter-spacing:.5px;">NEW MESSAGE</span></td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:32px 32px 12px;">
          <div style="font-size:11px;line-height:16px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:#6b8f35;">Website inquiry</div>
          <h1 style="margin:8px 0 10px;font-size:26px;line-height:34px;letter-spacing:-.5px;color:#171a20;">You have a new message.</h1>
          <p style="margin:0;font-size:14px;line-height:23px;color:#697180;">Someone has reached out through your portfolio contact form. Here are their details.</p>
        </td></tr>
        <tr><td style="padding:16px 32px 8px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e7e9ee;border-radius:12px;">
            <tr><td style="padding:16px 18px;border-bottom:1px solid #e7e9ee;width:110px;font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#818896;">Name</td><td style="padding:16px 18px;border-bottom:1px solid #e7e9ee;font-size:14px;font-weight:700;color:#20242c;">${escapeHtml(name.trim())}</td></tr>
            <tr><td style="padding:16px 18px;border-bottom:1px solid #e7e9ee;font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#818896;">Email</td><td style="padding:16px 18px;border-bottom:1px solid #e7e9ee;font-size:14px;color:#20242c;word-break:break-word;"><a href="mailto:${escapeHtml(email.trim())}" style="color:#527b1d;text-decoration:none;font-weight:700;">${escapeHtml(email.trim())}</a></td></tr>
            <tr><td style="padding:16px 18px;font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#818896;">Subject</td><td style="padding:16px 18px;font-size:14px;color:#20242c;">${escapeHtml(subject.trim())}</td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:20px 32px 28px;">
          <div style="margin-bottom:10px;font-size:11px;line-height:16px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#818896;">Message</div>
          <div style="background:#f7f9f4;border-left:4px solid #c2f970;border-radius:0 10px 10px 0;padding:20px;font-size:14px;line-height:24px;color:#303640;white-space:normal;overflow-wrap:anywhere;">${escapeHtml(message.trim()).replace(/\r?\n/g, "<br>")}</div>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:22px;"><tr><td style="background:#c2f970;border-radius:8px;"><a href="mailto:${escapeHtml(email.trim())}?subject=${encodeURIComponent(`Re: ${subject.trim()}`)}" style="display:inline-block;padding:13px 19px;color:#15190f;text-decoration:none;font-size:13px;font-weight:700;">Reply to ${escapeHtml(name.trim())} &nbsp; →</a></td></tr></table>
        </td></tr>
        <tr><td style="background:#f8f9fb;border-top:1px solid #e9ebf0;padding:20px 32px;text-align:center;">
          <p style="margin:0 0 5px;font-size:12px;font-weight:700;color:#4b5360;">Sai Chandu <span style="color:#7ea83d;">·</span> Portfolio</p>
          <p style="margin:0;font-size:11px;line-height:18px;color:#9299a5;">This notification was sent from your portfolio contact form.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`, 
    });
    return res.json({ ok: true });
  } catch (error) {
    console.error("SMTP send error:", error.message);
    return res.status(502).json({ error: "The email could not be sent. Check SMTP settings and try again." });
  }
});

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

app.listen(PORT, () => console.log(`Portfolio running at http://localhost:${PORT}`));
