# Quick Setup Checklist

## Step-by-Step Setup (Takes 5 minutes)

### ✅ Phase 1: Google Sheet Creation
- [ ] Go to [Google Sheets](https://sheets.google.com)
- [ ] Create a new spreadsheet named **"Student Applications"**
- [ ] Copy the **Sheet ID** from URL (`https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`)
- [ ] Keep sheet name as **"StudentData"** (or note if changed)

### ✅ Phase 2: Google Apps Script Setup
- [ ] Go to [Google Apps Script](https://script.google.com)
- [ ] Create a **"New Project"**
- [ ] Replace code with content from `APPS_SCRIPT_CODE.gs`
- [ ] Update **SHEET_ID** at the top (line 5)
- [ ] Update **SHEET_NAME** at the top (line 6) - should be "StudentData"

### ✅ Phase 3: Initialize the Sheet (IMPORTANT!)
- [ ] In Apps Script editor, open the **function dropdown** (top of editor)
- [ ] Select **`setupSheet`**
- [ ] Click the **▶️ Run button** (or press Ctrl+Enter)
- [ ] Grant permissions when popup appears
- [ ] Check the **Execution log** for: **"✓✓✓ SETUP COMPLETE ✓✓✓"**
- [ ] Verify your Google Sheet now has columns with blue header row

### ✅ Phase 4: Deploy the Script
- [ ] Click **"Deploy"** button (top right)
- [ ] Select **"New Deployment"**
- [ ] Select type: **"Web app"**
- [ ] Execute as: Your Google Account
- [ ] Who has access: **"Anyone"**
- [ ] Click **"Deploy"**
- [ ] **Copy the Deployment URL** (looks like: `https://script.google.com/macros/s/ABC123.../exec`)

### ✅ Phase 5: Update React Apps
Update both files with your deployment URL:

**PersonalInfo.jsx** (Line ~118)
```javascript
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";
```

**AdminDashboard.jsx** (Line ~8)
```javascript
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";
```

### ✅ Phase 6: Test Everything
- [ ] Go to PersonalInfo page
- [ ] Fill in the form completely
- [ ] Click Submit
- [ ] Check Google Sheet - should see new row with data
- [ ] Go to AdminDashboard
- [ ] Verify all data appears in table
- [ ] Click Edit button on a row
- [ ] Change a value and save
- [ ] Verify change appears in Google Sheet

---

## Troubleshooting

### "Permission denied" error
→ Run `setupSheet()` function and click "Allow" when prompted

### "Failed to fetch" or blank table in AdminDashboard
→ Check deployment URL is correct and accessible

### Sheet not created or columns missing
→ Run `setupSheet()` function again from Apps Script editor

### Data not saving to sheet
→ Run `testConnection()` function to verify connection

---

## Important Notes

⚠️ **DO NOT SKIP Phase 3** - The `setupSheet()` function is required to initialize everything
⚠️ **Replace BOTH deployment URLs** in PersonalInfo.jsx AND AdminDashboard.jsx
⚠️ **Save files** after updating URLs in React files
⚠️ **Refresh browser** after making changes

---

## File Locations

| File | What to Update |
|------|---|
| `APPS_SCRIPT_CODE.gs` | SHEET_ID and SHEET_NAME (lines 5-6) |
| `src/StudentPanel/PersonalInfo.jsx` | GOOGLE_SCRIPT_URL (line ~118) |
| `src/AdminPanel/AdminDashboard.jsx` | GOOGLE_SCRIPT_URL (line ~8) |

---

## Quick Reference Commands (Run in Apps Script)

| Function | Purpose |
|----------|---------|
| `setupSheet()` | Create sheet and table (run first!) |
| `testConnection()` | Verify connection works |
| `getSheetStats()` | View sheet statistics |
| `clearAllData()` | Delete all records (warning!) |

---

## Success Indicators

✓ Google Sheet created with 34 columns  
✓ Header row is blue with white text  
✓ First student form submission creates a new row in sheet  
✓ AdminDashboard loads and displays data  
✓ Editing and saving works - changes appear in Google Sheet  

---

## Need Help?

1. Check the **Execution Log** in Apps Script (Ctrl+Enter or View → Logs)
2. Open **Browser DevTools** (F12) and check Console tab
3. Run `testConnection()` function to diagnose issues
4. See SETUP_GUIDE.md for detailed troubleshooting
