// ============================================================
// MICKYMARVELS LLC - Google Apps Script Backend
// FILE: Paste this ENTIRE file into Google Apps Script
// URL: https://script.google.com
// ============================================================
//
// SETUP INSTRUCTIONS (do this once):
// 1. Go to https://script.google.com → New Project
// 2. Paste this entire file, replacing the default code
// 3. Click "Save" (floppy disk icon)
// 4. Run → Run function → "setupSheet" (first time only)
// 5. Deploy → New Deployment → Web App
//    - Execute as: Me
//    - Who has access: Anyone
// 6. Copy the Web App URL → paste into index.html as APPS_SCRIPT_URL
//
// YOUR EMAIL SETTINGS (edit these two lines):
var SENDING_EMAIL   = "your-sending-account@gmail.com";   // Gmail that SENDS emails
var RECEIVING_EMAIL = "your-receiving-account@gmail.com"; // Gmail that RECEIVES notifications
var SHEET_NAME      = "MickyMarvels_Leads";
// ============================================================

// ---------- MAIN ENTRY POINT ----------
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action || "contact";

    if (action === "contact")  return handleContact(data);
    if (action === "notify")   return handleNotify(data);
    if (action === "send_msg") return handleSendMsg(data);

    return respond({ success: false, error: "Unknown action" });
  } catch (err) {
    return respond({ success: false, error: err.message });
  }
}

// Allow GET for health check / CORS preflight
function doGet(e) {
  return respond({ success: true, message: "MickyMarvels API is live" });
}

// ---------- CONTACT FORM HANDLER ----------
function handleContact(data) {
  var sheet = getOrCreateSheet(SHEET_NAME);

  // Auto-add headers if row 1 is empty
  if (sheet.getLastRow() === 0) addHeaders(sheet);

  var row = [
    new Date(),
    data.fname + " " + data.lname,
    data.email,
    data.phone || "",
    data.service || "",
    data.level || "",
    data.msg || "",
    "New",           // Status
    "",              // Notes
  ];
  sheet.appendRow(row);

  // Email to RECEIVING account (admin notification)
  sendAdminNotification(data);

  // Confirmation email to the person who filled the form
  sendConfirmationEmail(data);

  return respond({ success: true, message: "Lead saved and emails sent" });
}

// ---------- STORE NOTIFY HANDLER ----------
function handleNotify(data) {
  var sheet = getOrCreateSheet("Store_Waitlist");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Date", "Email"]);
  }
  sheet.appendRow([new Date(), data.email]);

  // Notify admin
  GmailApp.sendEmail(
    RECEIVING_EMAIL,
    "New Store Waitlist Signup - MickyMarvels",
    data.email + " just signed up for the store waitlist.",
    { from: SENDING_EMAIL }
  );

  return respond({ success: true, message: "Added to waitlist" });
}

// ---------- MANUAL MESSAGE SEND HANDLER ----------
function handleSendMsg(data) {
  // This logs manually triggered admin emails
  GmailApp.sendEmail(
    data.to_email,
    data.subject || "Message from MickyMarvels LLC",
    data.body,
    {
      from: SENDING_EMAIL,
      name: "MickyMarvels LLC"
    }
  );

  // Log it in a Messages sheet
  var sheet = getOrCreateSheet("Messages_Log");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Date", "To Name", "To Email", "Channel", "Subject", "Preview"]);
  }
  sheet.appendRow([
    new Date(),
    data.to_name || "",
    data.to_email || "",
    data.channel || "Email",
    data.subject || "",
    (data.body || "").substring(0, 100)
  ]);

  return respond({ success: true, message: "Message sent and logged" });
}

// ---------- EMAIL HELPERS ----------
function sendAdminNotification(data) {
  var subject = "🔔 New Lead: " + data.fname + " " + data.lname + " — " + (data.service || "General Inquiry");

  var body = [
    "New lead submitted on MickyMarvels LLC website.",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "CONTACT DETAILS",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "Name:     " + data.fname + " " + data.lname,
    "Email:    " + data.email,
    "Phone:    " + (data.phone || "Not provided"),
    "Service:  " + (data.service || "Not selected"),
    "Level:    " + (data.level || "Not selected"),
    "",
    "MESSAGE:",
    data.msg || "(No message)",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "Submitted: " + new Date().toLocaleString(),
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "Login to your Admin Dashboard to follow up.",
  ].join("\n");

  var htmlBody = [
    "<div style='font-family:Arial,sans-serif;max-width:600px;'>",
    "<div style='background:#0a1628;padding:24px;border-radius:12px 12px 0 0;'>",
    "<h2 style='color:#c9a84c;margin:0;font-size:22px;'>MickyMarvels LLC</h2>",
    "<p style='color:rgba(255,255,255,0.6);margin:6px 0 0;font-size:13px;'>New Lead Notification</p>",
    "</div>",
    "<div style='background:#f8f6f0;padding:28px;border-radius:0 0 12px 12px;border:1px solid #e8e8ec;'>",
    "<h3 style='color:#0a1628;margin-top:0;'>🔔 New Contact Form Submission</h3>",
    "<table style='width:100%;border-collapse:collapse;'>",
    row_html("Name", data.fname + " " + data.lname),
    row_html("Email", "<a href='mailto:" + data.email + "'>" + data.email + "</a>"),
    row_html("Phone", data.phone || "Not provided"),
    row_html("Service", data.service || "Not selected"),
    row_html("Level", data.level || "Not selected"),
    "</table>",
    "<div style='background:#fff;border:1px solid #e8e8ec;border-radius:8px;padding:16px;margin-top:16px;'>",
    "<p style='font-size:12px;color:#9b9bac;margin:0 0 6px;text-transform:uppercase;letter-spacing:0.06em;'>Message</p>",
    "<p style='margin:0;color:#2d2d3a;font-size:14px;line-height:1.6;'>" + (data.msg || "<em>No message</em>") + "</p>",
    "</div>",
    "<p style='font-size:12px;color:#9b9bac;margin-top:16px;'>Submitted: " + new Date().toLocaleString() + "</p>",
    "</div></div>"
  ].join("");

  GmailApp.sendEmail(RECEIVING_EMAIL, subject, body, {
    from: SENDING_EMAIL,
    htmlBody: htmlBody,
    name: "MickyMarvels LLC"
  });
}

function sendConfirmationEmail(data) {
  var subject = "We received your message — MickyMarvels LLC";

  var htmlBody = [
    "<div style='font-family:Arial,sans-serif;max-width:600px;'>",
    "<div style='background:#0a1628;padding:28px;border-radius:12px 12px 0 0;text-align:center;'>",
    "<h1 style='color:#c9a84c;margin:0;font-size:26px;font-weight:900;'>MickyMarvels LLC</h1>",
    "<p style='color:rgba(255,255,255,0.6);margin:8px 0 0;font-size:13px;'>Practical Agile Mentoring for Real-World Success</p>",
    "</div>",
    "<div style='background:#ffffff;padding:36px;border:1px solid #e8e8ec;'>",
    "<h2 style='color:#0a1628;margin-top:0;'>Hi " + data.fname + "! 👋</h2>",
    "<p style='color:#5a5a70;font-size:15px;line-height:1.7;'>Thank you for reaching out to MickyMarvels LLC. We've received your message and will get back to you <strong>within 24 hours</strong>.</p>",
    "<div style='background:#f8f6f0;border-left:4px solid #c9a84c;padding:16px 20px;border-radius:4px;margin:24px 0;'>",
    "<p style='margin:0;font-size:13px;color:#2d2d3a;'><strong>Service requested:</strong> " + (data.service || "General inquiry") + "</p>",
    "</div>",
    "<h3 style='color:#0a1628;'>What happens next?</h3>",
    "<ol style='color:#5a5a70;font-size:14px;line-height:1.8;padding-left:20px;'>",
    "<li>We review your message and goals</li>",
    "<li>We reach out within 24 hours to schedule a free discovery call</li>",
    "<li>You get a personalized mentoring plan</li>",
    "<li>We start working together toward your Agile goals</li>",
    "</ol>",
    "<div style='background:#0a1628;border-radius:8px;padding:20px;margin-top:28px;text-align:center;'>",
    "<p style='color:rgba(255,255,255,0.6);font-size:13px;margin:0 0 4px;'>Questions? Reply to this email or reach us at</p>",
    "<a href='mailto:" + SENDING_EMAIL + "' style='color:#c9a84c;font-weight:700;font-size:14px;'>" + SENDING_EMAIL + "</a>",
    "</div>",
    "</div>",
    "<div style='background:#f8f6f0;padding:16px;border-radius:0 0 12px 12px;text-align:center;'>",
    "<p style='font-size:11px;color:#9b9bac;margin:0;'>© 2025 MickyMarvels LLC · Agile Coaching & Mentoring</p>",
    "</div>",
    "</div>"
  ].join("");

  GmailApp.sendEmail(data.email, subject, "Hi " + data.fname + "! We received your inquiry and will be in touch within 24 hours. — MickyMarvels LLC", {
    from: SENDING_EMAIL,
    htmlBody: htmlBody,
    name: "MickyMarvels LLC"
  });
}

// ---------- UTILITY ----------
function row_html(label, value) {
  return "<tr><td style='padding:8px 0;font-size:12px;color:#9b9bac;text-transform:uppercase;letter-spacing:0.06em;width:90px;'>" + label + "</td>"
       + "<td style='padding:8px 0;font-size:14px;color:#2d2d3a;font-weight:500;'>" + value + "</td></tr>";
}

function getOrCreateSheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

function addHeaders(sheet) {
  sheet.appendRow([
    "Submitted Date", "Full Name", "Email", "Phone",
    "Service", "Experience Level", "Message", "Status", "Notes"
  ]);
  sheet.getRange(1, 1, 1, 9).setFontWeight("bold").setBackground("#0a1628").setFontColor("#c9a84c");
}

function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Run this ONCE manually to create the sheet
function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    addHeaders(sheet);
    Logger.log("Sheet created: " + SHEET_NAME);
  } else {
    Logger.log("Sheet already exists.");
  }
}
