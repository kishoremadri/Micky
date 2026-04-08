# MickyMarvels LLC — Complete Setup Guide
# All integrations: Google Apps Script (Email) + Twilio (SMS/WhatsApp) + Vercel (Hosting)
# Estimated time: 45–60 minutes total

===============================================================
OVERVIEW OF WHAT YOU'RE SETTING UP
===============================================================

  Browser (index.html)
      │
      ├──► Google Apps Script ──► Gmail (sends emails)
      │         └──► Google Sheets (stores all leads)
      │
      ├──► Vercel Twilio Proxy ──► Twilio ──► SMS (phone)
      │                                  └──► WhatsApp (phone)
      │
      └──► localStorage ──► Admin Dashboard (local backup)

ALL FREE:
  - Google Apps Script: Free with any Google account
  - Twilio Trial: Free $15 credit (hundreds of SMS messages)
  - Vercel: Free tier (Hobby plan, no credit card needed)
  - GitHub: Free (needed to deploy to Vercel)

===============================================================
PART 1: GOOGLE APPS SCRIPT (EMAIL)
Time: ~15 minutes
===============================================================

WHAT YOU NEED:
  - Two Gmail accounts:
    Account A = sending@gmail.com  (the one that SENDS emails)
    Account B = receiving@gmail.com (the one that RECEIVES notifications)

STEP 1: Create a Google Sheet
  1. Go to https://sheets.google.com
  2. Click "+ New" → Blank Spreadsheet
  3. Name it: "MickyMarvels LLC"
  4. Leave it open (you'll come back)

STEP 2: Open Google Apps Script
  1. In your Google Sheet: click "Extensions" menu
  2. Click "Apps Script"
  3. A new tab opens with a code editor
  4. DELETE all existing code in the editor (select all, delete)

STEP 3: Paste the Script
  1. Open the file: /scripts/google-apps-script.js
  2. Copy the ENTIRE contents
  3. Paste into the Apps Script editor
  4. Find these two lines near the top and update them:
       var SENDING_EMAIL   = "your-sending-account@gmail.com";
       var RECEIVING_EMAIL = "your-receiving-account@gmail.com";
  5. Replace with YOUR actual Gmail addresses

STEP 4: Run Setup (one time)
  1. Click the "Select function" dropdown → choose "setupSheet"
  2. Click the ▶ Run button
  3. A popup asks for permissions → click "Review permissions"
  4. Choose your Google account (the SENDING one)
  5. Click "Advanced" → "Go to MickyMarvels (unsafe)" → Allow
  6. Run it again — you should see "Execution completed" in the log

STEP 5: Deploy as Web App
  1. Click "Deploy" button (top right)
  2. Click "New deployment"
  3. Click the gear icon next to "Type" → select "Web app"
  4. Fill in:
       Description: MickyMarvels Live v1
       Execute as: Me (your Google account)
       Who has access: Anyone
  5. Click "Deploy"
  6. Copy the Web App URL — it looks like:
       https://script.google.com/macros/s/AKfycby.../exec
  7. SAVE THIS URL — you need it in the next step!

STEP 6: Add URL to Your Website
  1. Open index.html in a text editor (Notepad++, VS Code, etc.)
  2. Find this line near the top:
       var APPS_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID_HERE/exec";
  3. Replace it with your actual URL from Step 5:
       var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby.../exec";
  4. Save the file

TEST IT:
  1. Open index.html in your browser
  2. Go to Contact page
  3. Fill in the form and submit
  4. Check your RECEIVING Gmail inbox — you should get a notification email
  5. Check your Google Sheet — a new row should appear with the lead data

TROUBLESHOOTING APPS SCRIPT:
  - "Script not found": Re-deploy and get a fresh URL
  - Emails not arriving: Check Spam folder in receiving Gmail
  - Permission error: Re-run setupSheet and re-authorize
  - CORS error in browser: This is normal — the script still works
    (Google Apps Script accepts the POST even with a CORS warning)


===============================================================
PART 2: TWILIO TRIAL ACCOUNT (SMS + WhatsApp)
Time: ~10 minutes setup
===============================================================

STEP 1: Create Free Twilio Account
  1. Go to https://www.twilio.com/try-twilio
  2. Sign up with your email
  3. Verify your email
  4. Enter your phone number (they send a verification code)
  5. Answer: "What are you building?" → choose "SMS"

  🎁 You get $15 FREE credit automatically (no credit card needed)

STEP 2: Get Your Credentials
  1. From the Twilio Console (https://console.twilio.com)
  2. On the dashboard, find and copy:
       Account SID:  ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
       Auth Token:   xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  3. Save these somewhere safe (you'll need them in Part 3)

STEP 3: Get a Free Twilio Phone Number
  1. In Twilio Console, go to: Phone Numbers → Manage → Buy a number
  2. Search for a US number that has "SMS" capability checked
  3. Click "Buy" — it uses your free trial credit (~$1/month)
  4. Copy the phone number: +1XXXXXXXXXX
  5. Save it for Part 3

STEP 4: Set Up WhatsApp Sandbox (Free Testing)
  1. In Twilio Console, go to: Messaging → Try it out → Send a WhatsApp message
  2. You'll see the sandbox number: +1 415 523 8886
  3. Send the JOIN code via WhatsApp to +1 415 523 8886
     (The code looks like "join shape-word" — Twilio shows it on screen)
  4. ✅ Your phone is now connected to the sandbox

NOTE ON TWILIO TRIAL:
  - Free trial can only send SMS/WhatsApp to VERIFIED phone numbers
  - To verify: Twilio Console → Phone Numbers → Verified Caller IDs → Add
  - Verified numbers = your phone, client phones you add manually
  - To send to ANY number: Upgrade to paid ($15+ credit remains)


===============================================================
PART 3: DEPLOY TWILIO PROXY TO VERCEL (FREE)
Time: ~20 minutes
===============================================================

WHY: Twilio's API can't be called directly from a browser (CORS).
     We deploy a tiny Node.js server to Vercel that sits between
     your website and Twilio.

WHAT YOU NEED:
  - Node.js installed: https://nodejs.org (LTS version)
  - A GitHub account: https://github.com
  - A Vercel account: https://vercel.com (sign up with GitHub)

STEP 1: Install Node.js (if not already installed)
  1. Download from https://nodejs.org/en/download
  2. Run the installer (click Next through everything)
  3. Open Terminal/Command Prompt and type: node --version
  4. Should print something like: v20.x.x ✓

STEP 2: Prepare the Proxy Files
  The /twilio-proxy/ folder contains:
    - index.js      (the server code)
    - package.json  (dependencies list)
    - vercel.json   (Vercel config)

STEP 3: Install Dependencies Locally (Test)
  1. Open Terminal/Command Prompt
  2. Navigate to the twilio-proxy folder:
       cd path/to/mickymarvels/twilio-proxy
  3. Run:
       npm install
  4. You'll see a node_modules folder appear
  5. Test locally (optional):
       TWILIO_ACCOUNT_SID=ACxxx TWILIO_AUTH_TOKEN=xxx TWILIO_FROM_PHONE=+1xxx node index.js
  6. Should print: "MickyMarvels Twilio Proxy running on port 3001"

STEP 4: Push to GitHub
  1. Go to https://github.com → Sign in → New Repository
  2. Name it: mickymarvels-twilio-proxy
  3. Set to Private
  4. Click "Create repository"
  5. Follow GitHub's instructions to push the twilio-proxy folder:
       git init
       git add .
       git commit -m "MickyMarvels Twilio proxy"
       git remote add origin https://github.com/YOURUSERNAME/mickymarvels-twilio-proxy.git
       git push -u origin main

STEP 5: Deploy to Vercel
  1. Go to https://vercel.com → Sign in with GitHub
  2. Click "New Project"
  3. Find and click "mickymarvels-twilio-proxy"
  4. Click "Import"
  5. In "Environment Variables", add these 4 variables:
       Name: TWILIO_ACCOUNT_SID    Value: ACxxxxxxxx (your Account SID)
       Name: TWILIO_AUTH_TOKEN     Value: xxxxxxxx   (your Auth Token)
       Name: TWILIO_FROM_PHONE     Value: +1XXXXXXXX (your Twilio number)
       Name: TWILIO_WA_FROM        Value: whatsapp:+14155238886
  6. Click "Deploy"
  7. Wait ~1 minute for deployment
  8. Copy the URL — it looks like: https://mickymarvels-twilio-proxy.vercel.app

STEP 6: Add URL to Your Website
  1. Open index.html
  2. Find these lines:
       var TWILIO_PROXY_URL   = "https://your-twilio-proxy.vercel.app/send-sms";
       var WHATSAPP_PROXY_URL = "https://your-twilio-proxy.vercel.app/send-whatsapp";
  3. Replace with your Vercel URL:
       var TWILIO_PROXY_URL   = "https://mickymarvels-twilio-proxy.vercel.app/send-sms";
       var WHATSAPP_PROXY_URL = "https://mickymarvels-twilio-proxy.vercel.app/send-whatsapp";
  4. Save the file

TEST IT:
  1. Go to Contact page in your website
  2. Submit the form with a verified phone number
  3. You should receive both an SMS and a WhatsApp message!

TROUBLESHOOTING TWILIO:
  - "Invalid to phone number": Add the number to Verified Caller IDs in Twilio
  - "21608 error": WhatsApp recipient hasn't joined the sandbox (send JOIN code first)
  - "Credentials not configured": Check Vercel environment variables
  - No SMS received: Check if phone is in E.164 format (+12025550000)


===============================================================
PART 4: HOST YOUR WEBSITE FOR FREE
Time: ~10 minutes
===============================================================

OPTION A: NETLIFY (Recommended — easiest)
  1. Go to https://netlify.com → Sign up free
  2. Drag and drop your entire mickymarvels folder onto the Netlify dashboard
  3. ✅ Your site is live in 30 seconds!
  4. Custom domain: Site settings → Domain management → Add custom domain
  5. Free SSL certificate included automatically

OPTION B: GITHUB PAGES (Also free)
  1. Push your project to GitHub (the main folder, not twilio-proxy)
  2. Go to repository Settings → Pages
  3. Source: Deploy from branch → main → /root
  4. Click Save
  5. Site is live at: https://USERNAME.github.io/REPO-NAME

OPTION C: VERCEL (Same as proxy — deploy everything there)
  1. Add index.html to the same or different Vercel project
  2. Vercel serves static HTML files automatically

RECOMMENDED FOR MICKYMARVELS:
  - Website: Netlify (easiest drag-and-drop)
  - Custom Domain: Buy from Namecheap (~$10/year for .com)
  - Connect domain to Netlify: Netlify → Domain settings → Add custom domain


===============================================================
PART 5: ADD GOOGLE ANALYTICS & META PIXEL
Time: ~10 minutes
===============================================================

GOOGLE ANALYTICS:
  1. Go to https://analytics.google.com
  2. Create account → Create property → Web
  3. Enter your website URL
  4. Copy your Measurement ID: G-XXXXXXXXXX
  5. In index.html, find the commented-out GA block:
       <!-- <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"> -->
  6. Uncomment it (remove <!-- and -->)
  7. Replace G-XXXXXXXXXX with your actual Measurement ID

META (FACEBOOK) PIXEL:
  1. Go to https://business.facebook.com
  2. Events Manager → Connect data source → Web → Facebook Pixel
  3. Copy your Pixel ID
  4. In index.html, find the commented-out Meta Pixel block
  5. Uncomment it and replace YOUR_PIXEL_ID with your actual ID


===============================================================
PART 6: ADMIN DASHBOARD LOGIN
===============================================================

  Default credentials:
    Username: admin
    Password: admin123

  TO CHANGE THE PASSWORD:
    1. Open index.html
    2. Find this line:
         if (u === 'admin' && p === 'admin123') {
    3. Change 'admin123' to your new password
    4. Save the file and re-upload to your host

  For production, consider adding Firebase Auth or similar.


===============================================================
QUICK REFERENCE — ALL YOUR URLS
===============================================================

After completing setup, fill in this reference:

  Website URL:           https://___________________________
  Google Apps Script URL: https://script.google.com/macros/s/________/exec
  Twilio Proxy URL:      https://_____________________________.vercel.app
  Sending Gmail:         _________________________________@gmail.com
  Receiving Gmail:       _________________________________@gmail.com
  Twilio Account SID:    AC______________________________________
  Twilio Phone:          +1____________________
  Google Sheet URL:      https://docs.google.com/spreadsheets/d/________


===============================================================
SUPPORT CHECKLIST
===============================================================

  ☐ Apps Script deployed and URL added to index.html
  ☐ Contact form submitted → email received in receiving Gmail
  ☐ Lead appears in Google Sheet
  ☐ Twilio account created and phone number purchased
  ☐ WhatsApp sandbox joined from test phone
  ☐ Twilio proxy deployed to Vercel with env variables set
  ☐ Proxy URLs added to index.html
  ☐ SMS received on test phone
  ☐ WhatsApp received on test phone
  ☐ Website deployed to Netlify/Vercel
  ☐ Custom domain connected (if purchased)
  ☐ Admin dashboard accessible and working
  ☐ Monthly report showing correct data


===============================================================
COSTS SUMMARY (All Free to Start)
===============================================================

  Service                  Cost
  ─────────────────────────────────────────────────────
  Google Apps Script       FREE (unlimited)
  Google Sheets            FREE (unlimited rows)
  Twilio Trial Credit      FREE $15 (~600 SMS messages)
  Twilio SMS after trial   ~$0.0079/message
  Twilio WhatsApp          FREE (sandbox) / ~$0.005/message
  Vercel Hobby Plan        FREE (100GB bandwidth/month)
  Netlify Free Plan        FREE (100GB bandwidth/month)
  GitHub                   FREE
  Domain name              ~$10-15/year (optional)
  SSL Certificate          FREE (included with Netlify/Vercel)
  ─────────────────────────────────────────────────────
  TOTAL TO START:          $0.00
