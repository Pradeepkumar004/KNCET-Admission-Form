# Complete Setup Guide: Google Sheets Integration

## Overview
This guide walks through setting up Google Sheets integration for the KNCET student admission form system with complete CRUD operations (Create, Read, Update, Delete).

---

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **"+ New"** to create a new spreadsheet
3. Name it: **"Student Applications"**
4. Keep the default sheet name as **"StudentData"** or rename it
5. Copy the Sheet ID from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
   - Example: `1aBcD3eFgHiJkLmNoPqRsTuVwXyZ`

---

## Step 2: Create Google Apps Script

### 2.1 Create the Script Project

1. Go to [Google Apps Script](https://script.google.com)
2. Click **"+ New Project"**
3. Name it: **"KNCET Student Form Handler"**
4. Replace the default code with the code from `APPS_SCRIPT_CODE.gs`

### 2.2 Configure the Script

In the Apps Script editor, at the top of the file, update these two lines:

```javascript
const SHEET_ID = "YOUR_SHEET_ID"; // Replace with your Google Sheet ID
const SHEET_NAME = "StudentData"; // Replace with your sheet name
```

Example:
```javascript
const SHEET_ID = "1aBcD3eFgHiJkLmNoPqRsTuVwXyZ";
const SHEET_NAME = "StudentData";
```

### 2.3 Setup the Sheet (IMPORTANT!)

1. In the Apps Script editor, find the **dropdown menu** that says "Select function"
2. Click on it and select **`setupSheet`**
3. Click the **▶️ Run button**
4. A popup may appear asking for permissions - **Click "Review Permissions"** and **"Allow"**
5. Wait for execution to complete - check the logs for "✓✓✓ SETUP COMPLETE ✓✓✓"

This will automatically:
- ✓ Create the Google Sheet (if it doesn't exist)
- ✓ Create the table with all 34 columns
- ✓ Add proper headers
- ✓ Format the header row (blue background, white text, bold)
- ✓ Freeze the header row for easy scrolling
- ✓ Auto-resize all columns

### 2.4 Verify Setup (Optional)

1. Select **`testConnection`** from the function dropdown
2. Click **▶️ Run**
3. Check the logs for "✓ Connection test PASSED"

### 2.5 Deploy the Script

1. Click **"Deploy"** → **"New Deployment"**
2. Select type: **"Web app"**
3. Configure:
   - Execute as: Your Google Account
   - Who has access: **"Anyone"** (for development)
4. Click **"Deploy"**
5. **Copy the Deployment URL** - it looks like:
   ```
   https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec
   ```

---

## Step 3: Update React Configuration

### 3.1 Update PersonalInfo.jsx

Replace the `GOOGLE_SCRIPT_URL` with your deployment URL:

```javascript
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";
```

### 3.2 Update AdminDashboard.jsx

Replace the `GOOGLE_SCRIPT_URL` with the same deployment URL:

```javascript
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";
```

---

## Step 4: Database Schema

Your Google Sheet will automatically have these columns:

| Column | Type | Description |
|--------|------|-------------|
| email | Text | Unique identifier (Student email) |
| fullName | Text | Student's full name |
| dob | Date | Date of birth |
| gender | Text | Male/Female |
| preference1 | Text | 1st Department Preference |
| preference2 | Text | 2nd Department Preference |
| preference3 | Text | 3rd Department Preference |
| quota | Text | Management/Government |
| entry | Text | I Year/Lateral Entry |
| accommodation | Text | Hostel/Day Scholar |
| roomType | Text | Single/Double/Triple |
| travelType | Text | Bus/Own Vehicle/Public Transport |
| fatherName | Text | Father's name |
| fatherOccupation | Text | Father's occupation |
| community | Text | OC/BC/BCM/MBC/SC/SCA/SCE/ST |
| caste | Text | Caste information |
| annualIncome | Text | Annual family income |
| address1 | Text | Door no, Village/Street name |
| address2 | Text | Panchayat/Town |
| taluk | Text | Taluk name |
| district | Text | District name |
| state | Text | State name |
| pincode | Text | Pin code |
| fatherContact | Text | Father's phone number |
| motherContact | Text | Mother's phone number |
| studentContact | Text | Student's phone number |
| sslcMarks | Text | SSLC marks |
| schoolName | Text | School name |
| govtSchool | Text | Yes/No |
| lastStudies | Text | HSC/CBSE/Diploma/etc |
| firstGrad | Text | First generation student indicator |
| status | Text | Registered/Approved/Pending/Rejected |
| date | DateTime | Submission date/time |

---

## Step 5: Data Flow

### Submit Student Form (PersonalInfo.jsx)
```
Student fills form → Click Submit → GET request to Apps Script → 
Data stored in Google Sheet → Redirect to next page
```

### View & Edit Data (AdminDashboard.jsx)
```
Admin Dashboard loads → Fetches all data via GET → 
Displays in table → Click Edit → Modal opens → 
Edit fields → Click Save → PUT request → 
Google Sheet updated → Table refreshed
```

---

## Step 6: API Endpoints

### GET - Fetch All Data
- **Method**: GET
- **URL**: `{GOOGLE_SCRIPT_URL}`
- **Response**: JSON array of all student records
- **Used by**: AdminDashboard to load all applications

### POST - Add New Record
- **Method**: GET (with query parameters)
- **URL**: `{GOOGLE_SCRIPT_URL}?fullName=John&email=john@example.com&...`
- **Parameters**: All form fields as query parameters
- **Response**: `{ success: true, message: "...", email: "..." }`
- **Used by**: PersonalInfo to submit new applications

### PUT - Update Existing Record
- **Method**: PUT
- **URL**: `{GOOGLE_SCRIPT_URL}`
- **Body**: JSON object with updated fields (email must be included)
- **Response**: `{ success: true, message: "...", email: "..." }`
- **Used by**: AdminDashboard modal to update student data

### DELETE - Delete Record
- **Method**: DELETE
- **URL**: `{GOOGLE_SCRIPT_URL}?email=student@example.com`
- **Response**: `{ success: true, message: "..." }`
- **Currently not used** but available if needed

---

## Step 7: Testing

### Test Student Form Submission
1. Go to PersonalInfo page
2. Fill in the form
3. Click Submit
4. Check your Google Sheet for the new row

### Test Admin Dashboard
1. Go to AdminDashboard page
2. Verify all submitted data appears in the table
3. Click Edit icon on any row
4. Change a value and click Save
5. Check Google Sheet to confirm changes

---

## Step 8: Troubleshooting

### Available Helper Functions

The Apps Script includes several helper functions you can run from the Apps Script editor:

#### `setupSheet()` - Initialize Everything (Run this FIRST!)
- Creates the Google Sheet if it doesn't exist
- Creates all 34 columns with proper headers
- Formats the header row (blue background, bold)
- Freezes the header row
- Auto-resizes all columns
- **Run this once at the beginning**

#### `testConnection()` - Verify Setup
- Tests if the connection to Google Sheet is working
- Verifies all headers are correct
- Shows total rows and columns
- Use this to verify setup is complete

#### `getSheetStats()` - View Statistics
- Shows total rows, columns, and data statistics
- Lists all column names
- Useful for debugging

#### `clearAllData()` - Delete All Records (Use with caution!)
- Deletes all data rows (keeps headers)
- Useful for testing/cleanup
- **WARNING: This cannot be undone!**

### Issue: "Script needs permission" when running setupSheet

This is normal! Follow these steps:
1. Click "Review Permissions" when the popup appears
2. Sign in with your Google account
3. Click "Allow" to grant the script access to your Google Sheets
4. The script will then complete setup

### Issue: "Failed to fetch data" in Admin Dashboard
- **Solution**: 
  - Make sure you ran `setupSheet()` function first
  - Check that SHEET_ID and SHEET_NAME are correct in Apps Script
  - Click on deployment URL to verify it's accessible

### Issue: Data not appearing in Google Sheet
- **Solution**: 
  1. Run `testConnection()` to verify connection
  2. Run `getSheetStats()` to see sheet structure
  3. Check that the Apps Script is deployed properly
  4. Make sure "Anyone" has access to the deployment

### Issue: "Email already exists" error
- **Solution**: This is working correctly - each student email must be unique

### Issue: Changes not reflecting in table
- **Solution**: 
  - Check browser console for errors (F12)
  - Verify the PUT request succeeded
  - Refresh the page manually if needed

### Issue: Columns are not properly formatted
- **Solution**: Run `setupSheet()` again to reformat all columns

---

## Step 9: Security Notes

⚠️ **Important for Production:**
- Change "Who has access" from "Anyone" to specific users
- Don't commit deployment URLs to Git
- Use environment variables for URLs
- Validate all inputs on both client and server side
- Consider rate limiting
- Use OAuth for authentication

---

## Step 10: Adding More Fields

To add new fields to the form:

1. **Add to PersonalInfo form**: Add input field to the form
2. **Add to formData state**: Include in initial state
3. **Add to AdminDashboard modal**: Add edit field for the new property
4. **Update Apps Script header**: Add new column name to headers array in `getSheet()`

---

## Quick Reference

| Task | File | What to Update |
|------|------|-----------------|
| Deploy Script | Apps Script | SHEET_ID, SHEET_NAME |
| Configure React Apps | PersonalInfo.jsx, AdminDashboard.jsx | GOOGLE_SCRIPT_URL |
| Add Form Fields | PersonalInfo.jsx | Form inputs and formData |
| Add Edit Fields | AdminDashboard.jsx | Modal form inputs |

---

## Support

For issues or questions:
1. Check browser console (F12) for error messages
2. Check Apps Script execution logs (Ctrl+Enter in Apps Script editor)
3. Verify Google Sheet has correct data
4. Ensure deployment URL is accessible
