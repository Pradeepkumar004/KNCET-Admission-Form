// Google Apps Script Code for Student Form Data Management
// COPY THIS ENTIRE CODE INTO YOUR GOOGLE APPS SCRIPT EDITOR
// 
// IMPORTANT: Update these two lines with your information:
// 1. Line 8: Replace "YOUR_SHEET_ID" with your Google Sheet ID
// 2. Line 9: Keep SHEET_NAME as "StudentData" (or change if your sheet has different name)

const SHEET_ID = "YOUR_SHEET_ID"; // Replace with your Google Sheet ID (find in URL)
const SHEET_NAME = "StudentData"; // Replace with your sheet name if different

// Define all headers for the sheet
const HEADERS = [
  "email",
  "fullName",
  "dob",
  "gender",
  "preference1",
  "preference2",
  "preference3",
  "quota",
  "entry",
  "accommodation",
  "roomType",
  "travelType",
  "fatherName",
  "fatherOccupation",
  "community",
  "caste",
  "annualIncome",
  "address1",
  "address2",
  "taluk",
  "district",
  "state",
  "pincode",
  "fatherContact",
  "motherContact",
  "studentContact",
  "sslcMarks",
  "schoolName",
  "govtSchool",
  "lastStudies",
  "firstGrad",
  "status",
  "date"
];

// Initialize or get the spreadsheet - Called automatically
function initializeSpreadsheet() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    // If sheet doesn't exist, create it
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      Logger.log("Created new sheet: " + SHEET_NAME);
    }
    
    // Check if headers exist
    const data = sheet.getDataRange().getValues();
    
    // If sheet is empty or headers are missing, add headers
    if (data.length === 0 || (data.length > 0 && data[0][0] !== "email")) {
      if (data.length > 0) {
        // Clear existing data and add headers
        sheet.clearContents();
      }
      sheet.appendRow(HEADERS);
      Logger.log("Created headers in sheet");
    }
    
    return sheet;
  } catch (error) {
    Logger.log("Error initializing spreadsheet: " + error.toString());
    throw new Error("Failed to initialize spreadsheet: " + error.toString());
  }
}

// Initialize or get the spreadsheet
function getSheet() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    // If sheet doesn't exist, create it
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(HEADERS);
      Logger.log("Sheet created with headers");
    } else {
      // Verify headers exist
      const data = sheet.getDataRange().getValues();
      if (data.length === 0 || data[0][0] !== "email") {
        // Headers missing, add them
        if (data.length > 0) {
          sheet.clearContents();
        }
        sheet.appendRow(HEADERS);
        Logger.log("Headers added to existing sheet");
      }
    }
    
    return sheet;
  } catch (error) {
    Logger.log("Error in getSheet: " + error.toString());
    throw new Error("Failed to get/create sheet: " + error.toString());
  }
}

// GET handler - Fetch all data from sheet OR add new data from form submission
function doGet(e) {
  try {
    // Check if this is a PUT request (update)
    if (e && e.parameter && e.parameter._method === "PUT") {
      return doPut(e);
    }
    
    // Check if this is a form submission (has email parameter) or a data fetch request
    if (e && e.parameter && e.parameter.email) {
      // This is a form submission - add new data
      return doPost(e);
    }
    
    // Otherwise, fetch all data
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const headers = data[0];
    const records = [];
    
    for (let i = 1; i < data.length; i++) {
      const record = {};
      for (let j = 0; j < headers.length; j++) {
        record[headers[j]] = data[i][j] || "";
      }
      // Add a unique ID (using email as identifier)
      record.id = record.email || "unknown-" + i;
      records.push(record);
    }
    
    return ContentService.createTextOutput(JSON.stringify(records))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log("Error in doGet: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// POST handler - Add new student data
function doPost(e) {
  try {
    const sheet = getSheet();
    const params = e.parameter || {};
    
    // Validate email (unique identifier)
    if (!params.email) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        message: "Email is required" 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Check if email already exists
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const emailIndex = headers.indexOf("email");
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][emailIndex] === params.email) {
        return ContentService.createTextOutput(JSON.stringify({ 
          success: false, 
          message: "Email already exists" 
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // Prepare row data
    const row = [];
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      if (header === "date") {
        row.push(new Date().toISOString());
      } else {
        row.push(params[header] || "");
      }
    }
    
    // Append new row
    sheet.appendRow(row);
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      message: "Data saved successfully",
      email: params.email
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// PUT handler - Update existing student data
function doPut(e) {
  try {
    const sheet = getSheet();
    
    // Get parameters from GET request (URLSearchParams)
    const payload = e.parameter;
    
    // Validate email (identifier for update)
    if (!payload.email) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        message: "Email is required for update" 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const emailIndex = headers.indexOf("email");
    
    // Find the row with matching email
    let rowFound = false;
    for (let i = 1; i < data.length; i++) {
      if (data[i][emailIndex] === payload.email) {
        // Update each field
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j];
          if (header === "email" || header === "_method") {
            // Don't update email (it's the identifier) or _method parameter
            continue;
          } else if (payload.hasOwnProperty(header)) {
            sheet.getRange(i + 1, j + 1).setValue(payload[header]);
          }
        }
        rowFound = true;
        break;
      }
    }
    
    if (!rowFound) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        message: "Student with this email not found" 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: true, 
      message: "Data updated successfully",
      email: payload.email
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log("Error in doPut: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// DELETE handler - Delete student data
function doDelete(e) {
  try {
    const sheet = getSheet();
    const params = e.parameter || {};
    
    if (!params.email) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        message: "Email is required for deletion" 
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    const emailIndex = data[0].indexOf("email");
    
    // Find and delete the row
    for (let i = 1; i < data.length; i++) {
      if (data[i][emailIndex] === params.email) {
        sheet.deleteRow(i + 1);
        return ContentService.createTextOutput(JSON.stringify({ 
          success: true, 
          message: "Data deleted successfully" 
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      message: "Student with this email not found" 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// CORS Support - Handle OPTIONS requests
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}

// ===== SETUP & INITIALIZATION FUNCTIONS =====

// Run this function once to initialize everything
// Go to Apps Script editor, select this function, and click Run
function setupSheet() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    
    // Try to get existing sheet
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    // If sheet doesn't exist, create it
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      Logger.log("✓ Sheet '" + SHEET_NAME + "' created successfully");
    } else {
      Logger.log("✓ Sheet '" + SHEET_NAME + "' already exists");
    }
    
    // Clear and setup headers
    const data = sheet.getDataRange().getValues();
    
    // Only clear if data exists and headers are wrong
    if (data.length > 0 && data[0][0] !== "email") {
      sheet.clearContents();
      Logger.log("✓ Cleared old data");
    }
    
    // Add headers if empty
    if (data.length === 0) {
      sheet.appendRow(HEADERS);
      Logger.log("✓ Headers added: " + HEADERS.length + " columns");
    }
    
    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setBackground("#4285F4");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    Logger.log("✓ Header row formatted");
    
    // Freeze header row
    sheet.setFrozenRows(1);
    Logger.log("✓ Header row frozen");
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, HEADERS.length);
    Logger.log("✓ Columns auto-resized");
    
    Logger.log("\n✓✓✓ SETUP COMPLETE ✓✓✓");
    Logger.log("Sheet: " + SHEET_NAME);
    Logger.log("Columns: " + HEADERS.length);
    Logger.log("Sheet ID: " + SHEET_ID);
    
  } catch (error) {
    Logger.log("✗ SETUP ERROR: " + error.toString());
    throw error;
  }
}

// Test the connection and verify everything works
function testConnection() {
  try {
    Logger.log("Testing connection...");
    
    const sheet = getSheet();
    Logger.log("✓ Sheet connection successful");
    
    const data = sheet.getDataRange().getValues();
    Logger.log("✓ Data retrieval successful");
    Logger.log("  - Total rows: " + data.length);
    Logger.log("  - Total columns: " + (data.length > 0 ? data[0].length : 0));
    
    if (data.length > 0 && data[0][0] === "email") {
      Logger.log("✓ Headers verified correctly");
      Logger.log("  - Headers: " + data[0].join(", "));
    }
    
    Logger.log("\n✓ Connection test PASSED");
    
  } catch (error) {
    Logger.log("✗ Connection test FAILED: " + error.toString());
    throw error;
  }
}

// Clear all data (WARNING: This deletes all records!)
function clearAllData() {
  try {
    const confirmation = true; // Change to false to prevent accidental deletion
    
    if (!confirmation) {
      Logger.log("Deletion cancelled");
      return;
    }
    
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length > 1) {
      // Keep header, delete data rows
      sheet.deleteRows(2, data.length - 1);
      Logger.log("✓ All data rows deleted (headers preserved)");
    } else {
      Logger.log("✓ Sheet already empty");
    }
    
  } catch (error) {
    Logger.log("✗ Error clearing data: " + error.toString());
  }
}

// Get sheet statistics
function getSheetStats() {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    
    Logger.log("=== SHEET STATISTICS ===");
    Logger.log("Sheet Name: " + SHEET_NAME);
    Logger.log("Total Rows: " + data.length + " (including header)");
    Logger.log("Total Columns: " + (data.length > 0 ? data[0].length : 0));
    Logger.log("Data Rows: " + Math.max(0, data.length - 1));
    Logger.log("\nColumns:");
    
    if (data.length > 0) {
      for (let i = 0; i < data[0].length; i++) {
        Logger.log("  " + (i + 1) + ". " + data[0][i]);
      }
    }
    
    Logger.log("\n=== END STATISTICS ===");
    
  } catch (error) {
    Logger.log("✗ Error getting stats: " + error.toString());
  }
}
