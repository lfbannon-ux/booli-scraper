# 🏠 Booli.se Housing Market Scraper

Automated daily scraper for Booli.se housing statistics with weekly email reports.

## 📊 What It Does

- **Daily Scraping**: Automatically scrapes Booli.se every day at 10:00 AM (Stockholm time)
- **Data Storage**: Stores housing statistics in a SQLite database
- **Weekly Reports**: Sends beautiful HTML email reports every Monday at 9:00 AM
- **Cloud Hosted**: Runs 24/7 on Railway with zero maintenance

## 🚀 Quick Deploy to Railway

### Prerequisites
- GitHub account
- Railway account (sign up at https://railway.app)
- Gmail account (for sending emails)

### Step 1: Gmail App Password

1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Name it "Booli Scraper"
4. Click "Generate"
5. **Save the 16-character password** - you'll need it!

### Step 2: Deploy to Railway

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select this repository
4. After deployment starts, click on your service
5. Go to "Variables" tab → "Raw Editor"
6. Paste these environment variables (replace with your info):

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
FROM_EMAIL=your-email@gmail.com
TO_EMAIL=where-to-send-reports@example.com
RUN_ON_STARTUP=false
```

7. Click "Save" - Railway will automatically redeploy
8. Check "Deployments" → Click latest deployment → View logs

You should see: `Booli Scraper Service Started` ✅

## 📧 Email Report Format

You'll receive a beautiful HTML email every Monday with:
- Weekly housing statistics table
- "For Sale" counts
- "Soon to be Sold" counts
- Date range covered
- Direct link to source

## 🛠️ Local Development

### Install Dependencies
```bash
npm install
```

### Setup Environment
```bash
cp .env.example .env
# Edit .env with your credentials
```

### Run Locally
```bash
npm run dev
```

### Test Scraper Immediately
Set `RUN_ON_STARTUP=true` in your `.env` file to run a scrape when the app starts.

## 📁 Project Structure

```
booli-scraper/
├── src/
│   ├── index.ts       # Main app & cron scheduler
│   ├── scraper.ts     # Playwright web scraper
│   ├── database.ts    # SQLite database layer
│   └── email.ts       # Email report generator
├── package.json
├── tsconfig.json
├── Dockerfile
└── README.md
```

## ⏰ Schedule

- **Daily Scrape**: 10:00 AM Stockholm time (Europe/Stockholm)
- **Weekly Report**: Monday 9:00 AM Stockholm time

## 🔧 Configuration

All configuration is done via environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username | `your-email@gmail.com` |
| `SMTP_PASS` | SMTP password/app password | `abcd efgh ijkl mnop` |
| `FROM_EMAIL` | Sender email address | `your-email@gmail.com` |
| `TO_EMAIL` | Recipient email address | `recipient@example.com` |
| `RUN_ON_STARTUP` | Run scrape on app startup | `false` |

## 📊 Database Schema

SQLite database with a single `snapshots` table:

```sql
CREATE TABLE snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,
  forSale INTEGER NOT NULL,
  soonToBeSold INTEGER NOT NULL,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## 🐛 Troubleshooting

### No emails received?
- Check Railway logs for errors
- Verify Gmail app password is correct
- Check spam folder
- Ensure `TO_EMAIL` is correct

### Scraper failing?
- Check Railway logs for Playwright errors
- Booli.se might have changed their website structure
- Network issues with Railway

### Want to test immediately?
- Set `RUN_ON_STARTUP=true` in Railway variables
- Check logs to see scrape happen immediately
- Set back to `false` after testing

## 📝 License

MIT

## 🤝 Contributing

Feel free to open issues or submit pull requests!

## ⚠️ Disclaimer

This tool is for personal use only. Please respect Booli.se's terms of service and robots.txt. Do not abuse their servers with excessive requests.
