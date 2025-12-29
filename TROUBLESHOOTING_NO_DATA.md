# Troubleshooting: Data Not Sending to Google Sheet

## ✅ Your Sheet ID is Configured
**Sheet ID:** `1XT-jtrCQ5jTm-rsK5D09TFqndeKyPO8dU21EUcnqTb0`

---

## 🔴 **If Data Still Not Saving, Follow These Steps:**

### **Step 1: Verify Apps Script Code is Updated**

In your Google Apps Script editor:
1. Check **line 5** has your Sheet ID:
   ```javascript
   const SHEET_ID = "1XT-jtrCQ5jTm-rsK5D09TFqndeKyPO8dU21EUcnqTb0";
   ```
2. Click **File** → **View version history** to confirm you saved it
3. If not, copy the provided code again and save (Ctrl+S)

### **Step 2: Run setupSheet() Function**

**IMPORTANT:** Run this function to initialize everything:

1. In Apps Script editor, select **`setupSheet`** from the function dropdown
2. Click **▶️ Run button**
3. When popup appears: Click **Review Permissions** → **Allow**
4. Open **Logs** (View → Logs or Ctrl+Enter)
5. Look for: **"✓✓✓ SETUP COMPLETE ✓✓✓"**

If you see an error:
- Check that SHEET_ID on line 5 is correct
- Try running `testConnection()` to diagnose

### **Step 3: Deploy the App Script**

Make sure your deployment is up-to-date:

1. Click **Deploy** → **New Deployment** (or see existing deployments)
2. If deploying new:
   - Type: **Web app**
   - Execute as: Your Google Account
   - Who has access: **Anyone**
   - Click **Deploy**
3. Copy the new deployment URL

### **Step 4: Update React Deployment URL (if changed)**

If you got a NEW deployment URL, update both files:

**PersonalInfo.jsx** (line ~122):
```javascript
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_NEW_ID/exec";
```

**AdminDashboard.jsx** (line ~8):
```javascript
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_NEW_ID/exec";
```

### **Step 5: Test with Browser Console**

1. **Refresh your React app** (F5)
2. Go to **PersonalInfo** page
3. Open **Browser DevTools** (F12)
4. Click **Console** tab
5. Fill form and click Submit
6. Watch the console - you should see:
   - `"Submitting form data..."`
   - `"Data to submit: {...}"`
   - `"Sending request to: ..."`
   - `"Response status: 200"`
   - `"Response data: {success: true, ...}"`

### **Step 6: Check Google Sheet**

1. Open your **Student Applications** Google Sheet
2. Look for a new row with your submitted data
3. Check that all columns have values

---

## 🔍 **Common Issues & Solutions**

### **Issue: "Cannot read property openById of undefined"**
**Solution:** SHEET_ID is wrong or not updated in Apps Script
- Go to Apps Script line 5
- Verify Sheet ID matches your Google Sheet
- Run setupSheet() again

### **Issue: "Sheet is not defined" in logs**
**Solution:** Sheet name doesn't exist
- Check line 9 in Apps Script: `const SHEET_NAME = "StudentData";`
- Make sure your sheet is named exactly "StudentData"
- Or update SHEET_NAME to match your actual sheet name

### **Issue: Browser console shows 403 error**
**Solution:** Deployment doesn't have permission
- Go back to Apps Script
- Click **Deploy**
- Edit the existing deployment
- Change "Who has access" to **"Anyone"**
- Save

### **Issue: Form submits but nothing appears in sheet**
**Solution:** Apps Script doGet handler may have error
- Open Apps Script
- Select **`testConnection`** from dropdown
- Click **▶️ Run**
- Check Logs (Ctrl+Enter)
- If error, read the error message and fix it

### **Issue: "Email already exists" error**
**Solution:** You submitted with same email twice
- Submit with a different email address
- Or clear data and try again (run `clearAllData()` function)

---

## ✅ **Checklist for Success**

- [ ] Sheet ID is correctly set in Apps Script (line 5)
- [ ] `setupSheet()` function was run successfully
- [ ] Logs show "✓✓✓ SETUP COMPLETE ✓✓✓"
- [ ] Deployment is set to "Anyone" has access
- [ ] React app is refreshed (F5)
- [ ] Form has all required fields filled
- [ ] Browser console shows "Response status: 200"
- [ ] Data appears in Google Sheet after submit

---

## 📞 **Still Not Working?**

1. **Run `testConnection()` in Apps Script**
   - Select it from dropdown
   - Click Run
   - Check logs for detailed error message

2. **Check Apps Script Logs**
   - In Apps Script, click View → Logs
   - Look for error messages
   - Copy and paste the error here

3. **Check Browser Console**
   - Press F12 in browser
   - Go to Console tab
   - Fill form and submit
   - Screenshot any errors

4. **Verify Sheet ID**
   - Open Google Sheet
   - Copy URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
   - Verify it matches line 5 in Apps Script

---

## 📝 **Current Configuration**

- **Sheet ID:** `1XT-jtrCQ5jTm-rsK5D09TFqndeKyPO8dU21EUcnqTb0`
- **Sheet Name:** `StudentData`
- **Deployment URL:** Check in Apps Script Deployments menu
- **React Apps:** PersonalInfo.jsx and AdminDashboard.jsx

All code is properly configured - the issue is likely just needing to run `setupSheet()` function!
